"use client";

import { useRef, useState } from "react";
import type { Customer } from "@/lib/api";
import { editCustomer } from "./actions";

const field =
  "w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted/70 focus:border-blue-500 focus:outline-none";
const label = "block text-xs font-medium uppercase tracking-wide text-muted";

export function EditCustomerButton({ customer }: { customer: Customer }) {
  const [open, setOpen] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-md px-2 py-1 text-xs text-muted transition-colors hover:bg-border hover:text-foreground"
      >
        Edit
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onClick={() => setOpen(false)}
        >
          <div
            className="w-full max-w-sm rounded-xl border border-border bg-background p-5 shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <h3 className="text-sm font-semibold text-foreground">
              Edit customer
            </h3>
            <p className="mt-0.5 text-xs text-muted">
              {customer.channel} · {customer.channel_user_id}
            </p>
            <form
              ref={formRef}
              action={async (formData) => {
                await editCustomer(formData);
                setOpen(false);
              }}
              className="mt-4 space-y-3"
            >
              <input type="hidden" name="id" value={customer.id} />
              <div>
                <label className={label} htmlFor="name">
                  Name
                </label>
                <input
                  id="name"
                  name="name"
                  defaultValue={customer.name ?? ""}
                  className={`mt-1 ${field}`}
                />
              </div>
              <div>
                <label className={label} htmlFor="company_name">
                  Company
                </label>
                <input
                  id="company_name"
                  name="company_name"
                  defaultValue={customer.company_name ?? ""}
                  className={`mt-1 ${field}`}
                />
              </div>
              <div>
                <label className={label} htmlFor="location">
                  Location
                </label>
                <input
                  id="location"
                  name="location"
                  defaultValue={customer.location ?? ""}
                  className={`mt-1 ${field}`}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={label} htmlFor="phone">
                    Phone
                  </label>
                  <input
                    id="phone"
                    name="phone"
                    defaultValue={customer.phone ?? ""}
                    className={`mt-1 ${field}`}
                  />
                </div>
                <div>
                  <label className={label} htmlFor="email">
                    Email
                  </label>
                  <input
                    id="email"
                    name="email"
                    defaultValue={customer.email ?? ""}
                    className={`mt-1 ${field}`}
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="rounded-lg px-3 py-1.5 text-sm text-muted transition-colors hover:text-foreground"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-blue-600 px-4 py-1.5 text-sm font-medium text-white transition-colors hover:bg-blue-500"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
