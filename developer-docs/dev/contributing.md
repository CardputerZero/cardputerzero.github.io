# Contributing

We welcome contributions to CardputerZero! Here's how to get involved.

## Ways to Contribute

- 🐛 **Report bugs** — Open an issue in the relevant repository
- 📝 **Improve documentation** — Fix typos, add examples, translate
- 🎮 **Build apps** — Create and publish apps to the AppStore
- 🔧 **Fix issues** — Pick from [Open Tasks](/dev/open-tasks)
- 🌐 **Translate** — Help translate docs to your language

## Development Setup

```bash
git clone https://github.com/CardputerZero/CardputerZero-AppBuilder.git
cd CardputerZero-AppBuilder
docker run --rm -v $(pwd):/src -w /src \
  ghcr.io/cardputerzero/build-env:latest \
  scripts/pack-all.sh
```

## Pull Request Guidelines

1. Fork the repository
2. Create a feature branch (`git checkout -b feat/my-feature`)
3. Make your changes
4. Test on device or emulator
5. Commit with a clear message
6. Push and open a PR

## Commit Messages

Follow conventional commits:
- `feat:` — New feature
- `fix:` — Bug fix
- `docs:` — Documentation only
- `refactor:` — Code change that doesn't fix/add
- `chore:` — Build/CI changes

## License

All contributions are under the MIT License unless otherwise specified.

## Community

- [GitHub Organization](https://github.com/CardputerZero)
- [Kickstarter](https://www.kickstarter.com/projects/m5stack/cardputerzero/)
