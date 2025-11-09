// Popup UI (src/App.tsx): This is the React component that opens when the user clicks the extension icon. It will contain the "Analyze" button and display the results.

import Body from "./components/Body";

//     Action: Contains a button that, when clicked, sends a message to the browser's API to run the content script.

//     Tech: React, TypeScript, Tailwind.
// for the themes:
// Primary Text (Headings): Luminous Cyan (text-cyan-300)
// Why it works: Cyan is very close to blue on the color wheel, but bright enough to glow. It fits the "deep sea" or "digital interface" vibe perfectly. I also added a subtle glow effect in CSS to enhance this.

// Body Text: Bright Light Gray (text-gray-100)
// Why it works: Provides maximum readability and contrast without stealing focus from the headings.

// Buttons (Call-to-Action): Vibrant Amber (bg-amber-400)
// Why it works: Amber (a yellow-orange) is directly complementary to the blue background. This color combination is powerful, creating high visual contrast that draws the eye immediately to the interactive element.

const App = () => {
  return (
    <div className="bg-linear-to-r from-[#030c5c] to-[#004e92]">
      <header className="flex justify-center">
        <img src="/src/public/vite.svg" alt="" />
        <h1 className="glow-text p-3.5 text-center text-3xl font-medium tracking-wider text-nowrap text-cyan-300">
          TOS summarizer
        </h1>
      </header>
      <Body />
    </div>
  );
};

export default App;
