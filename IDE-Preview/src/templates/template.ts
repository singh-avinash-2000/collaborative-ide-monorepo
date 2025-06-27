export const getReactTemplate = (entryPoint: string) => {
	return `
        import React from "react";
        import ReactDOM from 'react-dom/client';
        import App from '${entryPoint}';

        const elm = document.getElementById('root');
        const root = ReactDOM.createRoot(elm!);

        root.render(<App />);
    `;
};

export const getSrcHtml = (minifiedJs: string) => {
	return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Collaborative-IDE</title>
      </head>
      <body style="padding:0px;margin:0px">
        <div id="root"></div>
        <script>
          ${minifiedJs}
        </script>
      </body>
      </html>
    `;
};
