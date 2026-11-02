// SPDX-License-Identifier: AGPL-3.0-or-later
// Copyright (C) 2026 Daniel Braniewski. See the LICENSE file for rights and obligations.
// Stable root-level Foundry entry point.
// Runtime initialization lives in scripts/bootstrap.mjs so the legacy entry path
// can remain available without registering hooks twice.
import "./scripts/bootstrap.mjs";
