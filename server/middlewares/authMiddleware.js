import User from "../models/User.js";
import { clerkClient } from "@clerk/express";


export const protectEducator = async (req, res, next) => {
    try {
        if (!req.auth || !req.auth.userId) {
            return res.json({ success: false, message: "Unauthorized. Authentication failed." });
        }

        const userId = req.auth.userId;
        let user = await User.findById(userId);

        // Fallback: If user not in MongoDB or role/type mismatch, check Clerk directly
        if (!user || user.role !== 'educator' || user.type !== 'educator') {
            try {
                const clerkUser = await clerkClient.users.getUser(userId);
                const role = clerkUser.unsafeMetadata?.role || clerkUser.publicMetadata?.role;

                if (role === 'educator') {
                    // Auto-sync: Create user if missing, or update if role/type mismatch
                    const userData = {
                        name: `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim() || 'Educator',
                        email: clerkUser.emailAddresses[0].emailAddress,
                        imageUrl: clerkUser.imageUrl,
                        role: 'educator',
                        type: 'educator'
                    };

                    if (!user) {
                        user = await User.create({ _id: userId, ...userData });
                    } else {
                        await User.findByIdAndUpdate(userId, userData);
                    }
                    return next();
                }
            } catch (clerkError) {
                console.error("Clerk Fallback Error:", clerkError.message);
            }

            return res.json({ success: false, message: "Unauthorized. Educator access required." });
        }

        next();
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};


