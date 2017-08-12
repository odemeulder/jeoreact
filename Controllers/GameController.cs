using Microsoft.AspNetCore.Mvc;
using System.Collections.Generic;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using System.Linq;

namespace jeoreact
{
    public class GameController : Controller
    {
        private readonly GameContext db;
        private readonly ILogger logger;

        public GameController(GameContext context, ILogger<GameController> logger)
        {
            this.db = context;
            this.logger = logger;
        }

        [Route("api/players")]
        [HttpGet]
        public IEnumerable<Player> GetPlayers()
        {
            return db.Players;
        }

        [HttpGet]
        [RouteAttribute("api/games")]
        public IEnumerable<Game> GetGames()
        {
            return db.Games.Include(g => g.Scores)
                        .ThenInclude(s => s.Player);
        }

        [HttpPost]
        [RouteAttribute("api/game/new")]
        public int Post([FromBody]Game game)
        {
            logger.LogTrace("ODM: " + game.PlayedOn + ' ' + game.Scores.First().Player);

            db.Games.Add(game);
            db.SaveChanges(); 

            return game.Id;
        }

        [HttpGet]
        [RouteAttribute("api/os")]
        public string GetOs()
        {
            return System.Runtime.InteropServices.RuntimeInformation.OSDescription;
        }
    }
}
