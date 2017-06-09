using System;
using System.Linq;
using System.Collections.Generic;
using Microsoft.EntityFrameworkCore;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Npgsql.EntityFrameworkCore.PostgreSQL;

namespace jeoreact
{
    public class GameContext : DbContext
    {
        public DbSet<Game> Games { get; set; }
        public DbSet<Player> Players { get; set; }
        public DbSet<GameScore> GameScores { get; set; }

        public GameContext(DbContextOptions<GameContext> options) : base(options) {}

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.HasPostgresExtension("uuid-ossp");

            modelBuilder.Entity<Player>()
                        .Property(p => p.Id)
                        .ValueGeneratedOnAdd();
            modelBuilder.Entity<Game>()
                        .Property(g => g.Id)
                        .ValueGeneratedOnAdd();
            modelBuilder.Entity<GameScore>()
                        .Property(gs => gs.Id)
                        .ValueGeneratedOnAdd();
        }
    }

    public class Player 
    {
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }
        public string Name { get; set; }
    }

    public class Game
    {
        public int Id { get; set; }
        public DateTime PlayedOn { get; set; }

        public ICollection<GameScore> Scores { get; set; }

    }

    public class GameScore 
    {
        public int Id { get; set; }
        public int Score { get; set; }
        public int GameId { get; set; }
        public int PlayerId { get; set; }

        public Player Player { get; set; }
    }
}
