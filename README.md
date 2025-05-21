# RPG
This is a simple roguelike game I put together in a spare time on my vacation.
![Game screenshot](screenshot.png)

## How to launch
Run the appropriate version from the GitHub's "Releases" section.

### Hot to build it yourself
- `npm run build`
- `npm run package`

After that, new executables will be in a `build` folder.

## Backlog
- Add magic
  - Intelligence attribute, Mana
  - Spellbook popup, Target selection popup
  - Mana potions
  - Robes, gloves, wands
    - Item modifiers that give additional mana, increase intelligence, increase damage
- Items dropped should not destroy items that lay on the current tile
- Add more details to the game map
- Add more monsters
- Add ring items
- Add amulet items
- Add new weapon modifiers
  - leach live - transfer hp from target to source
  - anti-leach live - spend hp per hit to deal more damage (or have better attributes)
- Add new monster modifiers
  - leach live
  - poisonous
    - add antidote that removes poisonous state
- Monsters' shouting should attract other monsters
- Add game save and load

## References
I took these games as inspirations. I had a lot of fun playing each one of them, and I highly recommend them. 

### Dwarf Fortress
- https://www.bay12games.com/dwarves/

### Dungeon Crawl
- https://crawl.develz.org/
- https://github.com/crawl/crawl

### Diablo 2
- https://diablo2.blizzard.com/en-us/
