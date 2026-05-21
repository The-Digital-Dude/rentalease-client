import React, { useEffect, useMemo, useState } from "react";
import {
  RiLoader4Line,
  RiLockPasswordLine,
  RiRefreshLine,
  RiSaveLine,
  RiUserLine,
} from "react-icons/ri";
import toast from "react-hot-toast";
import technicianService, {
  type TechnicianProfile,
} from "../../services/technicianService";
import "./TechnicianProfileSelf.scss";

type ProfileFormState = {
  firstName: string;
  lastName: string;
  phone: string;
  licenseNumber: string;
  licenseExpiry: string;
  experience: string;
  hourlyRate: string;
  street: string;
  suburb: string;
  state: string;
  postcode: string;
};

const mapProfileToForm = (profile: TechnicianProfile): ProfileFormState => ({
  firstName: profile.firstName || "",
  lastName: profile.lastName || "",
  phone: profile.phone || "",
  licenseNumber: profile.licenseNumber || "",
  licenseExpiry: profile.licenseExpiry
    ? String(profile.licenseExpiry).split("T")[0]
    : "",
  experience:
    profile.experience === undefined || profile.experience === null
      ? ""
      : String(profile.experience),
  hourlyRate:
    profile.hourlyRate === undefined || profile.hourlyRate === null
      ? ""
      : String(profile.hourlyRate),
  street: profile.address?.street || "",
  suburb: profile.address?.suburb || "",
  state: profile.address?.state || "",
  postcode: profile.address?.postcode || "",
});

const TechnicianProfileSelf: React.FC = () => {
  const [profile, setProfile] = useState<TechnicianProfile | null>(null);
  const [form, setForm] = useState<ProfileFormState | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      const nextProfile = await technicianService.getProfile();
      setProfile(nextProfile);
      setForm(mapProfileToForm(nextProfile));
    } catch (err: any) {
      setError(err.message || "Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const canSave = useMemo(() => {
    return Boolean(form?.firstName.trim() && form?.lastName.trim());
  }, [form]);

  const updateField = (key: keyof ProfileFormState, value: string) => {
    setForm((prev) => (prev ? { ...prev, [key]: value } : prev));
  };

  const handleSave = async () => {
    if (!form || !canSave) {
      toast.error("First name and last name are required");
      return;
    }

    try {
      setSaving(true);
      const updated = await technicianService.updateProfile({
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        phone: form.phone.trim(),
        licenseNumber: form.licenseNumber.trim(),
        licenseExpiry: form.licenseExpiry || undefined,
        experience: form.experience ? Number(form.experience) : undefined,
        hourlyRate: form.hourlyRate ? Number(form.hourlyRate) : undefined,
        address: {
          street: form.street.trim(),
          suburb: form.suburb.trim(),
          state: form.state.trim(),
          postcode: form.postcode.trim(),
        },
      });
      setProfile(updated);
      setForm(mapProfileToForm(updated));
      toast.success("Profile updated successfully");
    } catch (err: any) {
      toast.error(err.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="technician-profile-self-page">
        <div className="profile-loading">
          <RiLoader4Line className="spin" />
          <p>Loading technician profile…</p>
        </div>
      </div>
    );
  }

  if (error || !profile || !form) {
    return (
      <div className="technician-profile-self-page">
        <div className="profile-error">
          <h2>Unable to load your profile</h2>
          <p>{error || "Profile data is unavailable."}</p>
          <button type="button" className="secondary-btn" onClick={loadProfile}>
            <RiRefreshLine /> Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="technician-profile-self-page">
      <div className="page-header">
        <div className="header-copy">
          <div className="header-icon">
            <RiUserLine />
          </div>
          <div>
            <h1>My Profile</h1>
            <p>Keep your technician details, licensing, and contact information current.</p>
          </div>
        </div>
        <div className="header-actions">
          <button type="button" className="secondary-btn" onClick={loadProfile}>
            <RiRefreshLine /> Refresh
          </button>
        </div>
      </div>

      <div className="profile-overview">
        <div className="overview-card">
          <span className="label">Email</span>
          <strong>{profile.email}</strong>
        </div>
        <div className="overview-card">
          <span className="label">Availability</span>
          <strong>{profile.availabilityStatus || "Unknown"}</strong>
        </div>
        <div className="overview-card">
          <span className="label">Current Jobs</span>
          <strong>{profile.currentJobs || 0}</strong>
        </div>
        <div className="overview-card">
          <span className="label">Completed Jobs</span>
          <strong>{profile.completedJobs || 0}</strong>
        </div>
      </div>

      <div className="profile-form-grid">
        <section className="profile-card">
          <h2>Basic Details</h2>
          <div className="field-grid">
            <label>
              First Name
              <input
                value={form.firstName}
                onChange={(event) => updateField("firstName", event.target.value)}
              />
            </label>
            <label>
              Last Name
              <input
                value={form.lastName}
                onChange={(event) => updateField("lastName", event.target.value)}
              />
            </label>
            <label>
              Phone
              <input
                value={form.phone}
                onChange={(event) => updateField("phone", event.target.value)}
              />
            </label>
            <label>
              Experience (years)
              <input
                type="number"
                min="0"
                value={form.experience}
                onChange={(event) => updateField("experience", event.target.value)}
              />
            </label>
          </div>
        </section>

        <section className="profile-card">
          <h2>Licensing & Rates</h2>
          <div className="field-grid">
            <label>
              License Number
              <input
                value={form.licenseNumber}
                onChange={(event) => updateField("licenseNumber", event.target.value)}
              />
            </label>
            <label>
              License Expiry
              <input
                type="date"
                value={form.licenseExpiry}
                onChange={(event) => updateField("licenseExpiry", event.target.value)}
              />
            </label>
            <label>
              Hourly Rate
              <input
                type="number"
                min="0"
                step="0.01"
                value={form.hourlyRate}
                onChange={(event) => updateField("hourlyRate", event.target.value)}
              />
            </label>
            <div className="password-note">
              <RiLockPasswordLine />
              <span>Password changes are still handled through the existing auth flow.</span>
            </div>
          </div>
        </section>

        <section className="profile-card full-width">
          <h2>Address</h2>
          <div className="field-grid">
            <label className="full-width">
              Street
              <input
                value={form.street}
                onChange={(event) => updateField("street", event.target.value)}
              />
            </label>
            <label>
              Suburb
              <input
                value={form.suburb}
                onChange={(event) => updateField("suburb", event.target.value)}
              />
            </label>
            <label>
              State
              <input
                value={form.state}
                onChange={(event) => updateField("state", event.target.value)}
              />
            </label>
            <label>
              Postcode
              <input
                value={form.postcode}
                onChange={(event) => updateField("postcode", event.target.value)}
              />
            </label>
          </div>
        </section>
      </div>

      <div className="page-actions">
        <button type="button" className="secondary-btn" onClick={loadProfile}>
          <RiRefreshLine /> Reset
        </button>
        <button
          type="button"
          className="primary-btn"
          onClick={handleSave}
          disabled={!canSave || saving}
        >
          {saving ? <RiLoader4Line className="spin" /> : <RiSaveLine />}
          {saving ? "Saving…" : "Save Changes"}
        </button>
      </div>
    </div>
  );
};

export default TechnicianProfileSelf;
