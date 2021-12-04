import React, { ReactNode } from "react";
import Head from "next/head";
import MainNavProjectDropdown from "./MainNavProjectDropdown";
import { MainNavItem } from "../components/MainNavItem";
import type Project from "../models/project";
import Link from "next/link";

type Props = {
  children?: ReactNode;
  title: string;
  section: string;
  projects: Project[];
  selectedProjectId: string | undefined;
};

type Page = {
  id: string;
  title: string;
};

const pages: Page[] = [{ id: "usergroups", title: "User Groups" }];

const Layout = ({
  children,
  title,
  section,
  projects,
  selectedProjectId,
}: Props) => {
  return (
    <div>
      <Head>
        <title>{title} | Treat Toolbox</title>
        <meta charSet="utf-8" />
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
        <link rel="stylesheet" href="https://rsms.me/inter/inter.css"></link>

        <meta
          name="description"
          content="Create and Launch Generative NFT Collections. Works with Metaplex Candy Machine on Solana."
        />
        <meta name="theme-color" content="#ffffff" />

        <meta property="og:url" content="https://treattoolbox.com/" />
        <meta property="og:type" content="website" />
        <meta
          property="og:title"
          content="Treat Toolbox | The Skeleton Crew | Generative NFTs for Metaplex Candy Machine"
        />
        <meta
          property="og:description"
          content="Create and Launch Generative NFT Collections. Works with Metaplex Candy Machine on Solana."
        />

        <meta name="twitter:card" content="summary_large_image" />
        <meta
          name="twitter:title"
          content="Treat Toolbox | The Skeleton Crew | Generative NFTs for Metaplex Candy Machine"
        />
        <meta
          name="twitter:description"
          content="A tool for creating Generative NFT Collections for Metaplex Candy Machine on Solana."
        />

        <link
          rel="icon"
          href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🍬</text></svg>"
        />
      </Head>
      <header>
        <nav className="bg-gray-800">
          <div className="mx-auto px-3">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Link href="/" passHref={true}>
                    <button>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-6 w-6"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          stroke="#ffffff"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1}
                          d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                        />
                      </svg>
                    </button>
                  </Link>
                </div>

                <div className="ml-5 w-1/2 flex">
                  <MainNavProjectDropdown
                    projects={projects}
                    selectedProjectId={selectedProjectId}
                  />
                </div>

                <div className="md:block">
                  <div className="ml-6 flex items-baseline space-x-4">
                    {pages.map((page) => (
                      <MainNavItem
                        key={page.id}
                        selected={page.id == section}
                        title={page.title}
                        path={"/" + page.id}
                      />
                    ))}

                    {/* {true
                      ? (
                        <button type="button" className="border border-gray-300 border-solid rounded-md uppercase text-gray-300 hover:bg-gray-700 hover:text-white px-3 py-1 text-xs font-medium">
                          Connect
                        </button>
                      )
                      : (
                        <button type="button" className="underline mt-1 text-gray-300 hover:bg-gray-700 hover:text-white px-3 py-2 rounded-md text-xs font-medium">
                          Connected: <span className="font-mono tracking-tighter">AaG3f...ZdAvP</span>
                        </button>
                      )
                    } */}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </nav>
      </header>
      {children}
      <footer className="text-gray-600 body-font">
        <hr />
        <div className="px-4 py-6 mx-auto flex items-center sm:flex-row flex-col">
          <p className="text-sm text-gray-500 sm:py-2 sm:mt-0 mt-4">
            © 2021 Skeleton Crew
          </p>
          <span className="inline-flex sm:ml-auto sm:mt-0 mt-4 justify-center sm:justify-start">
            <a
              href="https://twitter.com/skeletoncrewrip"
              className="text-gray-500"
              rel="noopener noreferrer"
              target="_blank"
            >
              <svg fill="currentColor" className="w-5 h-5" viewBox="0 0 24 24">
                <path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z"></path>
              </svg>
            </a>
            <a
              href="https://discord.gg/skeletoncrewrip"
              className="text-gray-500 ml-4"
              rel="noopener noreferrer"
              target="_blank"
            >
              <svg
                fill="currentColor"
                xmlns="http://www.w3.org/2000/svg"
                className="w-5 h-5"
                viewBox="0 0 30 30"
              >
                <path d="M25.12,6.946c-2.424-1.948-6.257-2.278-6.419-2.292c-0.256-0.022-0.499,0.123-0.604,0.357 c-0.004,0.008-0.218,0.629-0.425,1.228c2.817,0.493,4.731,1.587,4.833,1.647c0.478,0.278,0.638,0.891,0.359,1.368 C22.679,9.572,22.344,9.75,22,9.75c-0.171,0-0.343-0.043-0.501-0.135C21.471,9.598,18.663,8,15.002,8 C11.34,8,8.531,9.599,8.503,9.615C8.026,9.892,7.414,9.729,7.137,9.251C6.86,8.775,7.021,8.164,7.497,7.886 c0.102-0.06,2.023-1.158,4.848-1.65c-0.218-0.606-0.438-1.217-0.442-1.225c-0.105-0.235-0.348-0.383-0.604-0.357 c-0.162,0.013-3.995,0.343-6.451,2.318C3.564,8.158,1,15.092,1,21.087c0,0.106,0.027,0.209,0.08,0.301 c1.771,3.11,6.599,3.924,7.699,3.959c0.007,0.001,0.013,0.001,0.019,0.001c0.194,0,0.377-0.093,0.492-0.25l1.19-1.612 c-2.61-0.629-3.99-1.618-4.073-1.679c-0.444-0.327-0.54-0.953-0.213-1.398c0.326-0.443,0.95-0.541,1.394-0.216 C7.625,20.217,10.172,22,15,22c4.847,0,7.387-1.79,7.412-1.808c0.444-0.322,1.07-0.225,1.395,0.221 c0.324,0.444,0.23,1.066-0.212,1.392c-0.083,0.061-1.456,1.048-4.06,1.677l1.175,1.615c0.115,0.158,0.298,0.25,0.492,0.25 c0.007,0,0.013,0,0.019-0.001c1.101-0.035,5.929-0.849,7.699-3.959c0.053-0.092,0.08-0.195,0.08-0.301 C29,15.092,26.436,8.158,25.12,6.946z M11,19c-1.105,0-2-1.119-2-2.5S9.895,14,11,14s2,1.119,2,2.5S12.105,19,11,19z M19,19 c-1.105,0-2-1.119-2-2.5s0.895-2.5,2-2.5s2,1.119,2,2.5S20.105,19,19,19z" />
              </svg>
            </a>
          </span>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
