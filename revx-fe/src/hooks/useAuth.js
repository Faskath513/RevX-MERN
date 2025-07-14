// import { useSession } from "next-auth/react";

// export const useAuth = () => {
//   const { data: session } = useSession();
  
//   if (!session) {
//     // Handle session not found case
//     return { user: null };
//   }

//   return { user: session.user }; // Assuming session contains the user data
// };
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";

export const useAuth = () => {
  const { data: session, status } = useSession();
  const router = useRouter();

  const handleSignOut = async () => {
    try {
      // Call the backend API to log out the user
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/logout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        // Clear the session on the client side (this might be automatically handled by next-auth)
        // Invalidate session or redirect to login page
        router.push("/auth/signin");
      } else {
        throw new Error("Failed to log out");
      }
    } catch (error) {
      console.error("Error during sign-out:", error);
    }
  };

  // Return the user data and the sign-out handler
  return {
    user: session?.user || null,
    handleSignOut,  // Include the handleSignOut function to be used for logging out
    isAuthenticated: status === "authenticated" // You can check if the user is authenticated
  };
};
