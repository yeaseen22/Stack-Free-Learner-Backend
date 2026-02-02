"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const app_1 = __importDefault(require("./app"));
const db_1 = __importDefault(require("./config/db"));
// import chalk from "chalk";
// import figlet from "figlet";
dotenv_1.default.config();
//database connection
const url = process.env.MONGO_URI;
if (!url) {
    throw new Error("MONGO_URI environment variable is not defined");
}
(0, db_1.default)(url);
const PORT = process.env.PORT || 5000;
app_1.default.listen(PORT, () => {
    // console.clear(); 
    // console.log(
    //   chalk.greenBright.bold(
    //     figlet.textSync("Programming Fighter", {
    //       font: "Mini",
    //       horizontalLayout: "default",
    //       width: 80,
    //     })
    //   )
    // );
    // console.log(chalk.gray("=".repeat(70)));
    // console.log(chalk.cyanBright(`🔗 Server: ${chalk.whiteBright(`http://localhost:${PORT}`)}`));
    // console.log(chalk.greenBright("✅ Status: Server is running successfully."));
    // console.log(chalk.yellowBright("💡 Tip: Keep building. Keep improving. You’ve got this!"));
    // console.log(chalk.magentaBright("🛠️  Backend is ready. Let the magic begin."));
    // // Divider End
    // console.log(chalk.gray("=".repeat(70)));
    console.log("server is running");
});
