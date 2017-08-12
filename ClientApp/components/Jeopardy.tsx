import * as React from 'react';
import * as moment from 'moment';

interface Player {
    id: number;
    name: string;
    score: number;
}

interface IPlayerProps {
    player: Player,
    incrementScore: Function,
    decrementScore: Function,
}

export class JeoPlayerDisplay extends React.Component<IPlayerProps,{}> {

    constructor(props: IPlayerProps) {
        super(props);
    }

    public render() {
        return (
            <div className='score-display'>
                <div onClick={(e) =>  { this.incrementScore(e, this.props.player.id) } }>
                    {this.props.player.name}
                    <br />
                    <span>{this.props.player.score}</span>
                </div>
                <span className="minus">
                 <a href="" onClick={(e) =>  { this.decrementScore(e, this.props.player.id) } }>
                    minus
                </a>                    
                </span>
            </div>
        )
    }

    private incrementScore(e, id) {
        this.props.incrementScore(id);
        e.preventDefault();
    }

    private decrementScore(e, id) {
        this.props.decrementScore(id);
        e.preventDefault();
    }
}

interface ApiPlayer {
    id: number;
    name: string;
}

interface JeoScoreBoardProps {
    players: Player[],
    incrementScore: Function,
    decrementScore: Function,
    resetScores: Function,
    saveScores: Function
}

export class JeoScoreBoard extends React.Component<JeoScoreBoardProps,{}> {

    constructor() {
        super();
    }

    public render() {
        return (
        <div>
            <h2>Current Game</h2>
            <div className="score-display-grid">
                {this.props.players.map((p) => 
                    <JeoPlayerDisplay 
                        player={p} 
                        key={p.id}
                        incrementScore={() => this.props.incrementScore(p.id)} 
                        decrementScore={() => this.props.decrementScore(p.id)} />
                )}
            </div>
            <div className="score-buttons" >
                <button onClick={() => this.props.resetScores()}>Reset Scores</button>
                <button onClick={() => this.props.saveScores()}>Save Scores</button>
            </div>

        </div>)
    }
}

interface ScoreRecord {
    Id: number,
    GameDate: String;
    Scores: String;
}

interface ApiGame {
    id?: number;
    playedOn: string;
    scores: ApiScore[]
}
interface ApiScore {
    score: number;
    playerId: number;
    player?: Player;
}

interface JeoScoreHistoryProps {
    games: ScoreRecord[]
}


export class JeoScoreHistory extends React.Component<JeoScoreHistoryProps,{}> {

    constructor() {
        super();
    }
    
    private GetScoreLine(scoreLine: ScoreRecord) {
        return  (           
            <tr key={scoreLine.Id}>
                <td>{scoreLine.GameDate}</td>
                <td>{scoreLine.Scores}</td>
            </tr>
        )
    }

    private GetGameScores() {
        return <tbody>{this.props.games.map(g => this.GetScoreLine(g))}</tbody>
    }
    
    public render () {
        let scores = this.GetGameScores();

        return (<div>
        <h2>Score History</h2>
        <table className='table'>
            <thead>
                <tr>
                    <th>Date</th>
                    <th>Scores</th>
                </tr>
            </thead>
            {scores}
        </table>
        </div>);
    }
}

interface JeopardyState {
    games: ScoreRecord[],
    players: Player[]
}

export class Jeopardy extends React.Component<{}, JeopardyState> {

    constructor() {
        super();
        this.state = { games: [], players: []};
    }

    public componentDidMount() {
        fetch('/api/players')
            .then(response => response.json() as Promise<ApiPlayer[]>)
            .then(data => {
                this.setState({ 'games': this.state.games
                    , 'players': data.map(p => ({ 'id': p.id, 'name': p.name, 'score': 0 })) });
            });
        fetch('/api/games')
            .then(response => response.json() as Promise<ApiGame[]>)
            .then(data => {
                var games = data.map(this.mapGameToScoreResults);
                this.setState({'games': games, 'players': this.state.players });
            });
    }

    private mapGameToScoreResults = (game: ApiGame):ScoreRecord => {
        return {  'GameDate': moment(game.playedOn.toString()).format('L')
            , 'Scores': this.formatScoreResults(game.scores)
            , 'Id': game.id};
    }

    private formatScoreResults = (scores: ApiScore[]):string => {
        return scores.map(gs => gs.player.name + ' (' + gs.score + ') ' ).join(',');
    }

    private incrementScore = (id: number) => {
        this.setState({players: this.state.players.map(p => {
            if (p.id === id) p.score++;
            return p;
        })})
    }

    private decrementScore = (id: number) => {
        this.setState({players: this.state.players.map(p => {
            if (p.id === id && p.score > 0) p.score--;
            return p;
        })})
    }

    private saveScores = () => {
        let game: ApiGame = { 
            'playedOn': moment().format('YYYY-MM-DD')
            , 'scores': this.state.players.map(s => ({playerId: s.id, score: s.score}))
        };
        this.saveScoresToDb(game)
            .then((gameId) => {
                game.id = gameId;
                game.scores.map((s => { 
                    s.player = this.state.players.filter(p => p.id == s.playerId)[0];
                    return s;
                }))
                this.state.games.push(this.mapGameToScoreResults(game));
                this.resetScores();
            });
    }

    private resetScores = () => {
        this.setState({players: this.state.players.map(p => { p.score = 0; return p; })});
    }

    private saveScoresToDb = (game: ApiGame) => {
        return fetch('/api/game/new',{
            method: "post",
            body: JSON.stringify(game),
            headers: new Headers({'Content-Type': 'application/json'})
	    })
        .then(response => response.json() as Promise<number>);
    }

    public render () {
        return (
        <div>
            <h1>Olivier Jeopardy</h1>
            <JeoScoreBoard 
                players={this.state.players}
                incrementScore={this.incrementScore}
                decrementScore={this.decrementScore}
                saveScores={this.saveScores}
                resetScores={this.resetScores}
            />
            <JeoScoreHistory games={this.state.games} />
        </div>)
    }

}