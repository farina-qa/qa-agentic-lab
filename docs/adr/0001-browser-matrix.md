# ADR 0001: chromium and firefox locally, all three browsers in CI

**Status:** accepted, 2026-08-26

## Context

Playwright ships three browser engines. On this Fedora 44 machine, webkit will
not launch. Its bundled binaries link against ICU 74, `libjpeg.so.8` and
libjxl 0.8, while Fedora 44 provides ICU 77, `libjpeg.so.62` and libjxl 0.11.

The `--with-deps` flag that normally installs the missing system libraries only
knows how to use `apt`, so it does nothing useful on Fedora. Symlinking the
system libraries to the expected names would satisfy the loader and then crash,
because the version numbers are major ABI versions rather than labels.

Chromium and firefox both launch on Fedora with no extra system packages.

## Decision

Local runs use chromium and firefox. The full chromium, firefox and webkit
matrix runs in CI on `ubuntu-latest`, where `--with-deps` works as intended.

## Consequences

A webkit-only defect is caught in CI rather than on the developer machine,
which is an acceptable delay for a project of this size. The alternative,
running the whole local suite in a container, adds a moving part to every run
and buys very little.
