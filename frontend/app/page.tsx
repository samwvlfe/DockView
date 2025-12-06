import Image from "next/image";

export default function Home() {
  return (
      <main>
        <div className="sidemenu">
          <Image
            className="sm-logo"
            src="/dockstar-xmas-logo.png"
            alt="dockstar xmas logo"
            priority
          />
          <div className="sm-option">Home</div>
          <div className="sm-option">Docks</div>
          <div className="sm-option">Diagnostics</div>
          <div className="sm-option">Settings</div>
        </div>
        <div className="content">
          <div className="bays-container">
            <div className="baylist">
              <div className="baylist.hdr">
                <div>Dock ID</div>
                <div>Dock Name</div>
                <div>Status</div>
                <div>Time of Status</div>
              </div>
            </div>
          </div>
          <div className="data-container"></div>
        </div>
      </main>
  );
}