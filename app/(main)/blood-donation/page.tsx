"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import Link from "next/link";
import { motion } from "framer-motion";
import { FaTint, FaPhone, FaFacebook, FaSearch } from "react-icons/fa";
import { useAuth } from "@/app/context/AuthProvider";
import PageLoader from "@/app/components/ui/PageLoader";

interface Donor {
  name: string;
  bloodGroup: string;
  contact: string;
  facebook: string;
  role: string;
}

const bloodGroupsFilter = [
  "all",
  "A+ ve", "A- ve", "B+ ve", "B- ve",
  "O+ ve", "O- ve", "AB+ ve", "AB- ve",
  "A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-",
];

export default function BloodDonationPage() {
  const { isLoggedIn } = useAuth();
  const router = useRouter();
  const [donors, setDonors] = useState<Donor[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [groupFilter, setGroupFilter] = useState("all");

  useEffect(() => {
    if (!isLoggedIn) {
      router.push("/login");
      return;
    }
    const fetchDonors = async () => {
      try {
        const res = await axios.get("/api/blood-donation");
        setDonors(res.data.donors || []);
      } catch (err) {
        console.error("Failed to fetch donors:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDonors();
  }, [isLoggedIn, router]);

  const filtered = donors.filter((d) => {
    const matchSearch =
      !search ||
      d.name.toLowerCase().includes(search.toLowerCase()) ||
      d.bloodGroup.toLowerCase().includes(search.toLowerCase());
    const matchGroup = groupFilter === "all" || d.bloodGroup === groupFilter;
    return matchSearch && matchGroup;
  });

  if (loading) {
    return <PageLoader label="Loading blood donors" />;
  }

  return (
    <div className="min-h-screen bg-background py-20 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-500/10">
            <FaTint className="text-3xl text-red-500" />
          </div>
          <h1 className="font-bebasNeue text-6xl md:text-8xl text-text-secondary mb-4 tracking-wider">
            BLOOD DONATION
          </h1>
          <p className="text-text-muted text-lg max-w-2xl mx-auto">
            Find BUAC members and alumni available for blood donation. Reach out
            directly in case of emergency.
          </p>
        </div>

        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name or blood group..."
              className="w-full bg-surface border border-text-secondary/20 rounded-xl pl-11 pr-4 py-3 text-text-secondary focus:outline-none focus:border-accent"
            />
          </div>
          <select
            value={groupFilter}
            onChange={(e) => setGroupFilter(e.target.value)}
            className="bg-surface border border-text-secondary/20 rounded-xl px-4 py-3 text-text-secondary focus:outline-none focus:border-accent"
          >
            {bloodGroupsFilter.map((g) => (
              <option key={g} value={g}>
                {g === "all" ? "All Groups" : g}
              </option>
            ))}
          </select>
        </div>

        {filtered.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((donor, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                className="bg-surface backdrop-blur-sm border border-text-secondary/10 rounded-2xl p-6 shadow-xl"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-bebasNeue text-2xl text-text-secondary tracking-wide">
                      {donor.name}
                    </h3>
                    <span className="text-xs uppercase tracking-widest text-accent">
                      {donor.role}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 rounded-full bg-red-500/10 px-3 py-1">
                    <FaTint className="text-red-500 text-sm" />
                    <span className="font-bold text-red-500">
                      {donor.bloodGroup}
                    </span>
                  </div>
                </div>
                <div className="space-y-2">
                  {donor.contact && (
                    <a
                      href={`tel:${donor.contact}`}
                      className="flex items-center gap-2 text-text-muted hover:text-accent transition-colors"
                    >
                      <FaPhone className="text-accent" /> {donor.contact}
                    </a>
                  )}
                  {donor.facebook && (
                    <a
                      href={donor.facebook}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-text-muted hover:text-accent transition-colors"
                    >
                      <FaFacebook className="text-accent" /> Facebook Profile
                    </a>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 text-text-muted">
            <FaTint className="text-5xl text-red-500/30 mx-auto mb-4" />
            <p className="text-lg">No available donors found.</p>
          </div>
        )}
      </div>
    </div>
  );
}