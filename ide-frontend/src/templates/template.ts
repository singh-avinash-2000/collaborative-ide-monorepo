export const getReactTemplate = (entryPoint: string) => {
	return `
    import React from "react";
    import ReactDOM from "react-dom/client";
    import App from '${entryPoint}';

    window.addEventListener('DOMContentLoaded', () => {
      const rootElement = document.getElementById('root');
      if (rootElement) {
        const root = ReactDOM.createRoot(rootElement);
        root.render(React.createElement(App));
      } else {
        console.error("Root element not found.");
      }
    });
  `;
};

export const getSrcHtml = (minifiedJs: string) => {
	return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>Collaborative IDE</title>
    </head>
    <body style="padding:0;margin:0;">
      <div id="root"></div>
      <script type="module">
        ${minifiedJs}
      </script>
    </body>
    </html>
  `;
};
