# List of all entry-points of the Ajf core package.
entryPoints = [
    "barcode",
    "calendar",
    "checkbox-group",
    "forms",
    "image",
    "node-icon",
    "page-slider",
    "reports",
    "time",
]

# List of all non-testing entry-points of the Ajf ionic package.
IONIC_ENTRYPOINTS = [
    ep
    for ep in entryPoints
    if not "/testing" in ep
]

# List of all testing entry-points of the Ajf ionic package.
IONIC_TESTING_ENTRYPOINTS = [
    ep
    for ep in entryPoints
    if not ep in IONIC_ENTRYPOINTS
]

# List of all entry-point targets of the Ajf ionic package.
IONIC_TARGETS = ["//src/ionic"] + ["//src/ionic/%s" % ep for ep in IONIC_ENTRYPOINTS]

# List of all testing entry-point targets of the Ajf ionic package.
IONIC_TESTING_TARGETS = ["//src/ionic/%s" % ep for ep in IONIC_TESTING_ENTRYPOINTS]

IONIC_SCSS_LIBS = [
    "//src/ionic/%s:%s_scss_lib" % (p, p.replace("-", "_"))
    for p in IONIC_ENTRYPOINTS
]
