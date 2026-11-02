# Release Notes 1.2.4

Fixes the cross-module species visibility contract so player-visible species never become `null` solely because Runyth Hunter's Bestiary has not exposed that monster to the current user. Hidden species fall back to `{ id }`, preserving privacy while keeping dependent validation safe.
