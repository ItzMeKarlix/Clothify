import { useState } from "react";
import toast from "react-hot-toast";

const InviteEmployeeForm = () => {
  const [email, setEmail] = useState("");

  const invite = async () => {
    const res = await fetch("/functions/v1/invite-employee", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email })
    });

    if (!res.ok) {
      toast.error("Invite failed");
      return;
    }

    toast.success("Invite sent!");
    setEmail("");
  };

  return (
    <div className="border p-4">
      <h3 className="text-sm uppercase mb-2">Invite Employee</h3>
      <input
        className="border p-2 w-full"
        value={email}
        onChange={e => setEmail(e.target.value)}
        placeholder="employee@email.com"
      />
      <button
        onClick={invite}
        className="mt-2 bg-black text-white px-4 py-2 text-xs"
      >
        Send Invite
      </button>
    </div>
  );
};

export default InviteEmployeeForm;
