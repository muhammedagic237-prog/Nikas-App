import { PageIntro } from "@/components/shared/page-intro";
import { readStore } from "@/lib/store";

export default async function SettingsPage() {
  const store = await readStore();
  const shop = store.shops[0];

  return (
    <>
      <PageIntro
        eyebrow="Settings"
        title="Shop defaults, team access, and the pieces we will swap to Supabase next."
        description="This screen is still lightweight, but it gives the repo a natural place for team management, checklists, and environment health."
      />

      <div className="settings-grid">
        <section>
          <p className="eyebrow">Shop profile</p>
          <dl className="key-value-list">
            <div>
              <dt>Name</dt>
              <dd>{shop.name}</dd>
            </div>
            <div>
              <dt>Phone</dt>
              <dd>{shop.phone}</dd>
            </div>
            <div>
              <dt>Email</dt>
              <dd>{shop.email}</dd>
            </div>
            <div>
              <dt>Address</dt>
              <dd>{shop.address}</dd>
            </div>
          </dl>
        </section>

        <section>
          <p className="eyebrow">Team access</p>
          <div className="list-stack">
            {store.users.map((user) => (
              <div className="list-row" key={user.id}>
                <div>
                  <strong>{user.fullName}</strong>
                  <p>{user.email}</p>
                </div>
                <span className="muted">{user.role}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="full-span">
          <p className="eyebrow">Supabase handoff</p>
          <p className="muted">
            The app is using a local JSON-backed store for this first build slice. SQL migrations are already
            included in `supabase/migrations` so we can swap reads and writes to Supabase without redesigning the
            route structure.
          </p>
        </section>
      </div>
    </>
  );
}
