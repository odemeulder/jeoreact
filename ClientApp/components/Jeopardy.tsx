import * as React from 'react';
import * as moment from 'moment';

interface Player {
    id: number;
    name: string;
    score: number;
}

interface IGamePlayersState {
    players: Player[];
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

export class JeoScoreBoard extends React.Component<{},IGamePlayersState> {

    constructor() {
        super();
        this.state = {'players' : []}
    }

    public componentDidMount() {
        fetch('/api/players')
            .then(response => response.json() as Promise<ApiPlayer[]>)
            .then(data => {
                this.setState({ players: data.map(p => ({ 'id': p.id, 'name': p.name, 'score': 0 })) });
            });
    }

    public render() {
        return (
        <div>
            <h2>Current Game</h2>
            <div className="score-display-grid">
                {this.state.players.map((p) => 
                    <JeoPlayerDisplay 
                        player={p} 
                        key={p.id}
                        incrementScore={() => this.incrementScore(p.id)} 
                        decrementScore={() => this.decrementScore(p.id)} />
                )}
            </div>
            <div className="score-buttons" >
                <button onClick={this.resetScores}>Reset Scores</button>
                <button onClick={this.saveScores}>Save Scores</button>
            </div>

        </div>)
    }

    private incrementScore(id: number) {
        this.setState({players: this.state.players.map(p => {
            if (p.id === id) p.score++;
            return p;
        })})
    }

    private decrementScore(id: number) {
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
        this.saveScoresToDb(game);
    }

    private resetScores = () => {
        this.setState({players: this.state.players.map(p => { p.score = 0; return p; })});
    }

    private saveScoresToDb = (game: ApiGame) => {
        fetch('/api/game/new',{
            method: "post",
            body: JSON.stringify(game),
            headers: new Headers({'Content-Type': 'application/json'})
	    });

        this.resetScores();
    }
}

interface IGameScoreProps {
    scoreLine: ScoreRecord
}

interface ScoreRecord {
    GameDate: String;
    Scores: String;
}

interface IGameHistoryState {
    games: ScoreRecord[]
}

interface ApiGame {
    playedOn: string;
    scores: ApiScore[]
}
interface ApiScore {
    score: number;
    playerId: number;
    player?: Player;
}


export class JeoScoreHistory extends React.Component<{},IGameHistoryState> {

    constructor() {
        super();
        this.state = {games : []};
    }

    public componentDidMount() {
        fetch('/api/games')
            .then(response => response.json() as Promise<ApiGame[]>)
            .then(data => {
                console.log(games);
                var games = data.map(game => {
                    let scores: string = game.scores.map(gs => gs.player.name + ' (' + gs.score + ') ' ).join(',');
                    let sr: ScoreRecord = { 'GameDate': moment(game.playedOn.toString()).format('L'), 'Scores': scores};
                    return sr;
                });
                this.setState({'games': games});
            });
    }
    
    private GetScoreLine(scoreLine: ScoreRecord) {
        return  (           
            <tr>
                <td>{scoreLine.GameDate}</td>
                <td>{scoreLine.Scores}</td>
            </tr>
        )
    }

    private GetGameScores() {
        return <tbody>{this.state.games.map(g => this.GetScoreLine(g))}</tbody>
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


export class Jeopardy extends React.Component<{}, {}> {

    public render () {
        return (
        <div>
            <h1>Olivier Jeopardy</h1>
            <JeoScoreBoard />
            <JeoScoreHistory />
        </div>)
    }

}