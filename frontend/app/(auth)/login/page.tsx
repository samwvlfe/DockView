"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseClient } from "@/lib/supabaseClient";
import styles from "./login.module.css"

export default function LoginPage() {
    const router = useRouter();
    const [supabase, setSupabase] = useState<any>(null);

    const [mode, setMode] = useState<"login" | "signup">("login");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        setSupabase(createSupabaseClient(window.localStorage));
    }, []);

    const handleSubmit = async () => {
    if (!supabase) return;

    setLoading(true);
    setError(null);

    let result;

    if (mode === "signup") {
        result = await supabase.auth.signUp({
        email,
        password,
        });
    } else {
        result = await supabase.auth.signInWithPassword({
        email,
        password,
        });
    }

    setLoading(false);

    if (result.error) {
        setError(result.error.message);
        return;
    }

    router.push("/dashboard");
    };


    return (
        <div className={styles.wrapper}>
        <div className={styles.card}>
            <h1 className={styles.logo}>DockView</h1>
            <p className={styles.subtitle}>
            {mode === "login"
                ? "Sign in to your dashboard"
                : "Create your account"}
            </p>

            <div className={styles.toggleRow}>
            <button
                className={mode === "login" ? styles.activeToggle : styles.toggle}
                onClick={() => setMode("login")}
            >
                Sign In
            </button>
            <button
                className={mode === "signup" ? styles.activeToggle : styles.toggle}
                onClick={() => setMode("signup")}
            >
                Sign Up
            </button>
            </div>

            <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={styles.input}
            />

            <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={styles.input}
            />

            {error && <div className={styles.error}>{error}</div>}

            <button
            onClick={handleSubmit}
            disabled={loading}
            className={styles.primaryBtn}
            >
            {loading
                ? "Please wait..."
                : mode === "login"
                ? "Sign In"
                : "Create Account"}
            </button>
        </div>
        </div>
    );
}

