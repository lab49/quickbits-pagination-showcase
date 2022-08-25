import type { NextPage } from "next";
import Head from "next/head";
import Image from "next/image";

import { Grid } from "./components/Grid";

const Home: NextPage = () => {
  return (
    <div>
      <Head>
        <title>quickbits: Pagination showcase</title>
        <meta name="description" content="quickbits: Pagination showcase" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main>
        <div className="flex flex-col">
          <div>
            <h1 className="text-2xl">Offset pagination</h1>

            <div className="flex">
              <div className="p-4 m-4 shadow-lg rounded-md border-solid border-2 bg-indigo-50 border-indigo-500">
                <Grid />
              </div>

              <div>grid scroll log</div>
            </div>
          </div>
          <div>
            <h1 className="text-2xl">Cursor pagination</h1>
            <div className="flex">
              <div className="p-4 m-4 shadow-lg rounded-md border-solid border-2 bg-indigo-50 border-indigo-500">
                <Grid type="cursor" />
              </div>

              <div>grid scroll log</div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Home;
