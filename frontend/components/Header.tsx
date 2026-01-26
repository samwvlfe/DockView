"use client";
import styles from "./Header.module.css";
import Image from "next/image";
import dockstarLogo from "@/public/dockstar-xmas-logo.png";

import Link from "next/link";
import { DockTurnoverPayload } from '../types/websocketTypes';

export default function Header() {
  return (
    <div className={`${styles.menu} apart`}>
        <div className="row center">
          <Image
              className={styles.logo}
              src={dockstarLogo}
              alt="dockstar xmas logo"
              width={7314}
              height={2568}
              priority
          />
          <div className={styles.option}><Link href="/dashboard" target="_blank">Home</Link></div>
        </div>
        <div className={styles["option-wrapper"]}>
            <div className={styles.option}><Link href="/controller" target="_blank">Controller</Link></div>
            {/* <div className={styles.option}>Home</div>
            <div className={styles.option}>Diagnostics</div>
            <div className={styles.option}>Account</div> */}
        </div>
    </div>
  );
}