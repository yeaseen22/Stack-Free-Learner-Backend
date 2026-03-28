import dotenv from "dotenv";
import app from "./app";
import connectDB from "./config/db";
// import chalk from "chalk";
// import figlet from "figlet";
dotenv.config();

//database connection
const url = process.env.MONGO_URI;
if (!url) {
  throw new Error("MONGO_URI environment variable is not defined");
}
connectDB(url);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
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
console.log("server is running")
});
