"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { useAuth } from "@/components/layout/AuthProvider";

import styles from "./SiteHeader.module.css";

const NAV_LINKS = [
  { href: "/", label: "Questions" },
  { href: "/questions/new", label: "Ask" }
];

export function SiteHeader() {
  const { currentUser, availableUsers, switchUser } = useAuth();
  const pathname = usePathname();

  return (
    <header className={styles.header}>
      <div className={styles.brandGroup}>
        <Link href="/" className={styles.logo}>
          signQA
        </Link>
        <nav className={styles.nav}>
          {NAV_LINKS.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={isActive ? styles.activeLink : styles.link}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className={styles.userGroup}>
        <div className={styles.avatar}>
          <img src={currentUser.avatarUrl} alt={currentUser.name} />
        </div>
        <div>
          <p className={styles.userName}>{currentUser.name}</p>
          <select
            className={styles.userSelect}
            value={currentUser.id}
            onChange={(event) => switchUser(Number(event.target.value))}
          >
            {availableUsers.map((user) => (
              <option key={user.id} value={user.id}>
                {user.name}
              </option>
            ))}
          </select>
        </div>
      </div>
    </header>
  );
}
