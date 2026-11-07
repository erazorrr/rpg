# Gameplay logs

Every process writes to a unique directory under `logs/`:

- `human-<UTC timestamp>-<pid>/` for an interactive game;
- `solver-<UTC timestamp>-<pid>/` for an automated run.

The logger retains the newest 20 human sessions and 10 solver sessions. Solver rotation never
removes human sessions, and rotation preserves every session whose process is still running so
parallel workers cannot delete one another's logs. Each session contains `session.json` plus JSON Lines (`.jsonl`) files.
Every line in a JSONL file is a complete JSON object and can be parsed independently.

`telemetry.jsonl` is the primary strategy log. Important events are:

- `game_start` and `game_over`;
- `player_action` for moves, waits, attacks, spells, consumables, and books;
- `turn` with the complete player state, equipment, inventory, terrain, atmosphere, and all
  visible or activated threats after NPCs act;
- `inventory_change`, `level_up_point`, `floor_transition`, and `kill`.

`combat.jsonl` contains structured weapon, spell, and damage-over-time results. The level and
loot generator files retain their existing diagnostic messages as JSON objects. `session.json`
identifies the session type, process, start time, and schema version.

For a useful human-versus-solver comparison, finish one play session before starting automated
runs. The newest `human-*` directory containing `telemetry.jsonl` is then the session to analyze.
