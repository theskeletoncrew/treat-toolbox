![Github Social Image](https://user-images.githubusercontent.com/89373652/137255583-80d58aae-cc14-413e-bf80-2b619673fde2.png)

[Treat Toolbox](https://treattoolbox.com) | Twitter [@TreatToolbox](https://twitter.com/TreatToolbox) | Discord: [Skeleton Crew](https://discord.gg/skeletoncrewrip)

Feeling generous? Your contributions help fund future development.  
Send tips to our Solana wallet: CH6afYjjydFLPSrfQYEUNCdSNohLCAQV6ir6QnYeZU3t

# About

[Treat Toolbox](https://treattoolbox.com) is an open-source utility for managing the creation of generative-art NFT projects. The project was built by the team that created [The Skeleton Crew](https://skeletoncrew.rip) for use on their own project.

Using Treat Toolbox, the final artwork for a project is created from a set of layered PNGs, each associated with user-defined "traits" and their specified rarities. The system is especially well-suited for [Solana](https://solana.com) based projects, as it is capable of exporting the artwork and metadata (PNG+JSON) pairs that are necessary for setting up [Metaplex's Candy Machine](https://github.com/metaplex-foundation/metaplex).

Benefits of Treat Toolbox:

- Fully web-based; no fumbling with shell scripts
- Built to be usable even by non-technical team members
- Handles Traits, Rarities, Artwork, and more
- Eliminates potential for duplicates
- Provides methods to avoid known conflicts in your art
- Exports directly to PNG+JSON for use with Metaplex Candy Machine

Today, the system is made to run locally, using an instance of the [Firebase emulator](https://firebase.google.com/docs/emulator-suite) as it's backing data and file storage. In the future, a hosted version may be made available.

# Setup

Prerequisites:

- Your machine should have npm, nodejs v14, and the java runtime installed.

First, you will need to get setup with Firebase, and install the Firebase emulator:

1. Install the [Firebase CLI](https://firebase.google.com/docs/cli)

2. Go to the [Firebase Console](https://console.firebase.google.com) and login.

3. Create a new project

4. Under Firestore Database click “Create database”. Start in Production Mode. Choose an appropriate location.

5. Go back to the "Project Overview" page, and under “Get Started by adding Firebase to your app”, click the </> icon named "Web". Register your app (hosting is not necessary).

6. Under “Use npm”, copy the keys provided for the firebaseConfig. Enter these in the appropriate places in the `.env` file included in Treat Toolbox.

```
NEXT_PUBLIC_FIREBASE_API_KEY=YYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYY
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=myproject.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=myproject
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=myproject.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=1111111111111
NEXT_PUBLIC_FIREBASE_APP_ID=1:1111111111111:web:3333333333333333333333
```

7. Go back to the "Functions" page, and click “Upgrade project”. Update your plan to get access to Firebase Functions (you wont be billed as long as you only use the emulators).

8. Run `firebase login` and follow the prompts to sign in.

9. Run `firebase init` in the root of the checked out repo. 

Use an existing project (the one you created in step 3).

Use the answers below:
```
Which Firebase features do you want to set up for this directory? 
Choose Firestore, Functions, Storage, Emulators.

What file should be used for Firestore Rules? 
firestore.rules [just press enter]

File firestore.rules already exists. Do you want to overwrite it with the Firestore Rules from the Firebase Console?
N [No]

What file should be used for Firestore indexes? 
firestore.indexes.json [just press enter]

File firestore.indexes.json already exists. Do you want to overwrite it with the Firestore Indexes from the Firebase Console?
N [No]

What language would you like to use to write Cloud Functions? 
Typescript

Do you want to use ESLint to catch probable bugs and enforce style? 
n [No]

File functions/package.json already exists. Overwrite? 
N [No]

File functions/tsconfig.json already exists. Overwrite? 
N [No]

File functions/src/index.ts already exists. Overwrite? 
N [Np]

File functions/.gitignore already exists. Overwrite? 
N [No]

Do you want to install dependencies with npm now? 
Y [Yes]

What file should be used for Storage Rules? 
storage.rules [just press enter]

File storage.rules already exists. Overwrite? 
N [No]

Which Firebase emulators do you want to set up? 
Functions, Firestore, Storage

Would you like to download the emulators now? 
y [Yes]
```

10. Next, start the emulators:

```bash
npm install --prefix=functions
npm run build --prefix=functions

# start firebase without data persistence:
firebase emulators:start

# or, with data persistence:
firebase emulators:start --import ~/.firebase-data --export-on-exit ~/.firebase-data
```

**_Note_**: _If the emulators fail to start, see `firestore-debug.log`. One common cause for failure is that you may need to install the [java runtime](http://www.java.com.)_

11. When the emulators start, the API url for your cloud functions will be output in the form:

`functions[us-central1-api]: http function initialized (http://localhost:5001/projectdemo-a111a/us-central1/api).`

Copy this url and enter it in the file `.env` for the value `NEXT_PUBLIC_FIREBASE_FUNCTIONS_API_ENDPOINT`.

12. Then, in a separate terminal, start the development web server:

```bash
npm install
npm run dev
```

13. Open [http://localhost:3000](http://localhost:3000) with your browser and start using Treat Toolbox!

# Working with Treat Toolbox

Here's a video of the basic usage of Treat Toolbox: https://vimeo.com/633276431  

### User Groups

To start, you'll want to create a user group that contains all of your project creators (those that will receive secondary sales royalties).

### Projects & Drops

Next create a project, and tap in to add your first "Drop" – a collection you plan to mint with [Candy Machine](https://github.com/metaplex-foundation/metaplex) and share with the world!

### Traits/Artwork/Conflicts/Composites

Tapping into the Drop will give you access to the tools necessary to define Traits, upload your Artwork and assign it to those Traits' values, specify any potential Conflicts that may exist between different image layers, and generate your final Composites.

### Export

Finally, for a generated Composite Set, you can use the "" feature to export a complete set of numbered images and metadata (PNG+JSON) ready for use with [Metaplex's Candy Machine](https://github.com/metaplex-foundation/metaplex)!

### Quick Start

Want to give treat toolbox a spin, but dont have artwork handy? Take a look at the samples we provided in the `test-images` directory. Just create three traits: "Curve", "Dot" and "Squiggle". Give each of them trait values, for ex. for "Squiggle", create the values "Green", "Magenta", "Purple", "Royal Purple", and "Teal". Then with the rarities you specify, you can run off a set of compositions and see the system at work.

### Troubleshooting

For now, Treat Toolbox is lacking robust error reporting. If something feels off, check for errors in either one of the two running terminals (the web frontend or the firebase emulators) or alternatively, open the web console from the browser and check for errors there. If you do run into a problem, please file an Issue, or better yet, open a PR!

### Made with Treat Toolbox

Help us get the word out about this tool by using the banner provided below as a way to comply with MIT LICENSE attribution requirements. Let's make sure that every artist who wants to launch an NFT Collection on Solana has the means to do so! Please link the banner to https://treattoolbox.com.

![Treat Toolbox Badge](https://user-images.githubusercontent.com/89115113/137352273-c4972230-8239-45b7-bfe1-be1767fd1115.png)
