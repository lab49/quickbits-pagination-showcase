import type { NextPage } from "next";
import Head from "next/head";

import { Grid } from "../components/Grid";

const Home: NextPage = () => {
  return (
    <div className="min-h-screen bg-gray-800">
      <Head>
        <title>quickbits: Pagination showcase</title>
        <meta name="description" content="quickbits: Pagination showcase" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main>
        <div className="flex flex-col">
          <div>
            <h1 className="text-2xl">Offset pagination</h1>

            <Grid />
          </div>
          <div>
            <h1 className="text-2xl">Cursor pagination</h1>

            <Grid type="cursor" />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Home;
