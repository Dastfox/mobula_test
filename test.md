Develop a script that retrieves historical market indicators for SGR20 tokens using a token entry.

About Surge :
<https://surgeprotocol.io/>
<https://docs.surgeprotocol.io/introduction/foreword>

Historical market indicators required:
Price history: [timestamp, price][] (required)
Volume history: [timestamp, 24-hour volume][] (highly desirable)
Liquidity history: [timestamp, liquidity][] (bonus)
History required from the genesis of the token (first day of trading) until now.

Preferred features:
Written in TypeScript
Compatible with a full node (no history node needed)

Challenges:
Limited documentation for Surge (probably not covered by ChatGPT)
Potential throughput limitations when using public nodes

Bonus:
Getting to have the data hourly and not just daily. (the only important thing to get done actually)

Example SRG20 token for testing: 0x43C3EBaFdF32909aC60E80ee34aE46637E743d65