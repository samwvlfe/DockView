"use client";
import { useState, useRef, useEffect } from "react";
import { WidgetKey, WIDGET_LABELS, WIDGET_BANK } from "./widgets/WidgetBank";
import styles from "./WidgetSelector.module.css";

interface WidgetSelectorProps {
    selected: WidgetKey[];
    onChange: (newSelection: WidgetKey[]) => void;
}

export default function WidgetSelector({ selected, onChange }: WidgetSelectorProps) {
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(e: MouseEvent) {
            if (ref.current && !ref.current.contains(e.target as Node)) {
                setOpen(false);
            }
        }
        if (open) {
            document.addEventListener("mousedown", handleClickOutside);
        }
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [open]);

    const allKeys = Object.keys(WIDGET_BANK) as WidgetKey[];

    const toggle = (key: WidgetKey) => {
        if (selected.includes(key)) {
            onChange(selected.filter(k => k !== key));
        } else {
            onChange([...selected, key]);
        }
    };

    return (
        <div className={styles.selector} ref={ref}>
            <button
                className={styles.gearBtn}
                onClick={() => setOpen(prev => !prev)}
                aria-label="Configure widgets"
            >
                &#9881;
            </button>

            {open && (
                <div className={styles.dropdown}>
                    {allKeys.map(key => (
                        <label key={key} className={styles.option}>
                            <input
                                type="checkbox"
                                checked={selected.includes(key)}
                                onChange={() => toggle(key)}
                            />
                            <span>{WIDGET_LABELS[key]}</span>
                        </label>
                    ))}
                </div>
            )}
        </div>
    );
}
