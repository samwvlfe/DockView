import Image from "next/image";

export default function Home() {
  return (
      <main>
        <div className="menu">
          <div className="logo-wrapper">
            <Image
              className="logo"
              src="/dockstar-xmas-logo.png"
              alt="dockstar xmas logo"
              width={7314}
              height={2568}
              priority
            />
          </div>
          <div className="option-wrapper">
            <div className="option">Home</div>
            <div className="option">Diagnostics</div>
            <div className="option">Account</div>
          </div>
        </div>
        
        <div className="content">
          <div className="bays-container">
            <div className="widget">
              <div className="widget-hdr">Dock Status Overview</div>
              <div className="widget-subhdr active-font">ACTIVE DOCKS (6)</div>
              <div className="baylist">
                <div className="bay active-border">
                  <div className="bay-hdr">
                    <div className="bay-name">Dock 003</div>
                    <div className="bay-status"><div className="open-time">00:32:36</div></div>
                  </div>
                  <div className="hist"><span>see history</span></div>
                </div>
                <div className="bay active-border">
                  <div className="bay-hdr">
                    <div className="bay-name">Dock 005</div>
                    <div className="bay-status"><div className="open-time">01:15:06</div></div>
                  </div>
                  <div className="hist"><span>see history</span></div>
                </div>
                <div className="bay active-border">
                  <div className="bay-hdr">
                    <div className="bay-name">Dock 001</div>
                    <div className="bay-status"><div className="open-time">01:33:21</div></div>
                  </div>
                  <div className="hist"><span>see history</span></div>
                </div>
                <div className="bay active-border">
                  <div className="bay-hdr">
                    <div className="bay-name">Dock 004</div>
                    <div className="bay-status"><div className="open-time">01:45:59</div></div>
                  </div>
                  <div className="hist"><span>see history</span></div>
                </div>
                <div className="bay active-border">
                  <div className="bay-hdr">
                    <div className="bay-name">Dock 002</div>
                    <div className="bay-status"><div className="open-time">02:22:22</div></div>
                  </div>
                  <div className="hist"><span>see history</span></div>
                </div>
                <div className="bay active-border">
                  <div className="bay-hdr">
                    <div className="bay-name">Dock 006</div>
                    <div className="bay-status"><div className="open-time">02:43:12</div></div>
                  </div>
                  <div className="hist"><span>see history</span></div>
                </div>
              </div>
              <div className="seperator"></div>
              <div className="widget-subhdr inactive-font">INACTIVE DOCKS (2)</div>
              <div className="baylist">
                <div className="bay">
                  <div className="bay-hdr">
                    <div className="bay-name inactive-font">Dock 007</div>
                  </div>
                  <div className="hist"><span>see history</span></div>
                </div>
                <div className="bay">
                  <div className="bay-hdr">
                    <div className="bay-name inactive-font">Dock 008</div>
                  </div>
                  <div className="hist"><span>see history</span></div>
                </div>
              </div>
            </div>
          </div>
          <div className="bay-info-container">
            <div className="widget">
              <div className="info-widget-hdr">
                <div className="info-widget-icon" style={{backgroundColor: '#3b82f6'}}>
                  <Image
                    className="logo"
                    src="/utilization-icon.png"
                    alt="Utilization Icon"
                    width={400}
                    height={400}
                    priority
                  />
                </div>
                <div className="stack">
                  <div className="widget-subhdr">UTILIZATION</div>
                  <div className="widget-hdr">72%</div>
                </div>
              </div>
            </div>
            <div className="widget">
              <div className="info-widget-hdr">
                <div className="info-widget-icon" style={{backgroundColor: '#f59e0b'}}>
                  <Image
                    className="logo"
                    src="/avg-time-icon.png"
                    alt="Average Time Icon"
                    width={400}
                    height={400}
                    priority
                  />
                </div>
                <div className="stack">
                  <div className="widget-subhdr">AVERAGE TRUNOVER</div>
                  <div className="widget-hdr">1hr 35m</div>
                </div>
              </div>
            </div>
            <div className="widget">
              <div className="info-widget-hdr">
                <div className="info-widget-icon" style={{backgroundColor: '#14b8a6'}}>
                  <Image
                    className="logo"
                    src="/completed-icon.png"
                    alt="Completed Icon"
                    width={400}
                    height={400}
                    priority
                  />
                </div>
                <div className="stack">
                  <div className="widget-subhdr">LOADS COMPLETED</div>
                  <div className="widget-hdr">35</div>
                </div>
              </div>
            </div>
            <div className="widget">
              <div className="info-widget-hdr">
                <div className="info-widget-icon" style={{backgroundColor: '#ef4444'}}>
                  <Image
                    className="logo"
                    src="/queue-icon.png"
                    alt="Trucks Queued Icon"
                    width={400}
                    height={400}
                    priority
                    style={{height: '40px'}}
                  />
                </div>
                <div className="stack">
                  <div className="widget-subhdr">TRUCKS QUEUED</div>
                  <div className="widget-hdr">7</div>
                </div>
              </div>
            </div>
            <div className="widget">
              <div className="widget-hdr">Todays Activity</div>
              <div className="graph-container">
                <div className="graph">
                  <Image
                    src="/graph-image.png"
                    alt="graph"
                    width={700}
                    height={300}
                    priority
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
  );
}