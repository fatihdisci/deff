"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"

export interface UserProfile {
    id: string
    email?: string | null
    displayName: string
    avatarId: string
    level: number
    xp: number
    createdAt?: string
}

export function useProfile() {
    const supabase = createClient()
    const [profile, setProfile] = useState<UserProfile | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        let mounted = true

        async function fetchProfile() {
            try {
                const { data: { user } } = await supabase.auth.getUser()
                if (!user) {
                    if (mounted) setLoading(false)
                    return
                }

                // Supabase Triggers should have created this profile row automatically on signup
                const { data, error } = await supabase
                    .from("profiles")
                    .select("*")
                    .eq("id", user.id)
                    .single()

                if (error && error.code !== "PGRST116") { // Ignore if not found entirely, though trigger should prevent this
                    console.error("Error fetching profile:", error)
                }

                if (data && mounted) {
                    setProfile({
                        id: data.id,
                        email: data.email,
                        displayName: data.display_name || "Savunucu",
                        avatarId: data.avatar_id || "shield",
                        level: data.level || 1,
                        xp: data.xp || 0,
                        createdAt: data.created_at,
                    })
                }
            } catch (err) {
                console.error("Unexpected error in useProfile:", err)
            } finally {
                if (mounted) setLoading(false)
            }
        }

        fetchProfile()

        return () => {
            mounted = false
        }
    }, [supabase])

    // Optimistic Update helper
    const updateProfile = async (updates: Partial<UserProfile>) => {
        if (!profile) return false

        // Optimistic
        const updatedProfile = { ...profile, ...updates }
        setProfile(updatedProfile)

        try {
            const { error } = await supabase
                .from("profiles")
                .update({
                    display_name: updatedProfile.displayName,
                    avatar_id: updatedProfile.avatarId,
                    level: updatedProfile.level,
                    xp: updatedProfile.xp
                })
                .eq("id", profile.id)

            if (error) throw error
            return true
        } catch (err) {
            console.error("Error updating profile:", err)
            // Rollback could be implemented here if critical
            return false
        }
    }

    return { profile, loading, updateProfile }
}
