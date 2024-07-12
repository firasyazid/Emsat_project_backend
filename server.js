let server;

module.exports = {
  startServer: (app, port) => {
    return new Promise((resolve) => {
      server = app.listen(port, () => {
        console.log(`Listening on port ${port}`);
        resolve();
      });
    });
  },
  closeServer: () => {
    return new Promise((resolve) => {
      server.close(() => {
        console.log('Server closed');
        resolve();
      });
    });
  },
};
