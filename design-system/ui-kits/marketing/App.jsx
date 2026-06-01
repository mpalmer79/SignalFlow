/* SignalFlow marketing kit, page composition */
function Site() {
  return (
    <React.Fragment>
      <Nav />
      <Hero />
      <LogoStrip />
      <Pillars />
      <NotJustCRM />
      <Band />
      <Safety />
      <Footer />
    </React.Fragment>
  );
}
ReactDOM.createRoot(document.getElementById("root")).render(<Site />);
