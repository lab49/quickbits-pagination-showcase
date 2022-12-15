import type { NextPage } from "next";
import Head from "next/head";

import { Grid } from "../components/Grid";

const Home: NextPage = () => {
  return (
    <div className="min-h-screen bg-stone-100">
      <Head>
        <title>quickbits: Pagination showcase</title>
        <meta name="description" content="quickbits: Pagination showcase" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main>
        <div className="flex flex-col">
          <div className="container mx-auto mt-5 mb-5">
            <h1 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">Offset pagination</h1>

            <Grid />
          </div>
          <div className="container mx-auto mb-5">
            <h1 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">Cursor pagination</h1>

            <Grid type="cursor" />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Home;
