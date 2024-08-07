# PumpFun Bot

It's a Bot for sniping memecoins on Pump.Fun in your CMD. Fully made in Typescript. It uses the Solana blockchain and the Anchor framework to interact with the Pump.Fun bonding curve contract. The bot is designed to be fast and efficient, allowing you to quickly and easily snipe memecoins. It includes features such as automatic token acquisition, automatic price monitoring, and configurable settings.

# Bot speed

The bot works pretty fast, it's in typescript so it will be obviously outperformed by other bots in Go/Rust, tho. That's why it's more likely a toy to experiment & learn than opportunity to earn some Sol.
However, the speed of the script is still second and RPC is another matter.
It is the RPC that determines how fast the tx will go through.
Using a free Quicknode RPC & automatic mode it took around 5-15s to be a coin since it's created.

# Main tools

- **Automatic sniper**: Launch a monitor on every new coin and automatically buy it
- **Single sniper**: Buy a single coin just by providing it's contract address
- _Soon more..._

## How to run

To run Pump.fun bot, follow these steps:

1. Clone the repository: `git clone https://github.com/carson2222/pumpfun-bot`
2. Navigate to the project directory: `cd pumpfun-bot`
3. Install the dependencies: `npm i`
4. Fill in `.env` (if you have no RPC, Quicknode is pretty good & free)
5. Build the application: `npm run build`
6. Run the bot using `auto` or `single` mode: `npm run <auto/single>`
7. Follow the steps in the cmd

## Technologies used

- [Solana web3.js library](https://solana-labs.github.io/solana-web3.js/)
- [@coral-xyz/anchor](https://www.npmjs.com/package/@coral-xyz/anchor)
- [@coral-xyz/borsh](https://www.npmjs.com/package/@coral-xyz/borsh)
- [@solana-developers/helpers](https://www.npmjs.com/package/@solana-developers/helpers)
- [@solana/spl-token](https://www.npmjs.com/package/@solana/spl-token)
- [@solana/web3.js](https://www.npmjs.com/package/@solana/web3.js)
- [bn.js](https://www.npmjs.com/package/bn.js)
- [dotenv](https://www.npmjs.com/package/dotenv)
- [esbuild](https://www.npmjs.com/package/esbuild)
- [inquirer](https://www.npmjs.com/package/inquirer)
- [typescript](https://www.npmjs.com/package/typescript)
