import connectToDatabase from "../lib/mongoose";

export async function getServerSideProps() {
  await connectToDatabase(); // MongoDBへの接続
}