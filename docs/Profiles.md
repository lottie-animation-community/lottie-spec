# Lottie Animation Format

### Version 0.0.1

### Status Draft

# Contents

[Background](#backbround)

[Objective](#objective)

[Modules](#modules)

[Profiles](#profiles)

[Sample Profiles](#sample-profiles)

[Tooling](#tooling)

[References](#references)


# Background
The open source Lottie animation format has been broadly adopted by designers
and product teams as the format of choice for representing motion graphics.
Lottie is lightweight, has easily swappable assets and attributes, and most
notably provides the ability to go directly from design to implementation.
The advantages of Lottie have won over many enthusiastic clients, and the
format is being used increasingly across the industry.

As adoption grows at record pace, the Lottie ecosystem now has several
different players for the format, and many tools attempting to import or export
Lottie JSON, each with a different feature set. These differences are creating
some friction for organizations which are targeting multiple platforms, or are
looking for stable format specification guarantees.

By offering a framework for feature versioning, defining player capabilities
and tooling/validation, we are hoping to address some of the existing concerns
and boost adoption of the Lottie animation format.


# Objective

Introduce the notion of, and propose a tentative/initial set of Modules and
Profiles.


# Modules

A ***module*** is a concise functional part of the general feature space, a
group of related features.

Inspired by the [CSS standardization process](
https://www.w3.org/Style/2011/CSS-process.en.html#:~:text=MODULES%20AND%20SNAPSHOTS
), modules can be versioned independently, thus allowing the specification to
evolve organically instead of a single/monolithic document. They also allow a
more concise formulation of profiles, by referring to modules/groups instead of
individual features.

The level of granularity is an open question: at one extreme, one could
potentially consider each feature its own module – but that would diminish the
value or outright defeat the purpose of using modules at all; at the other
extreme, modules that are too coarse would make it difficult to accurately
describe existing players’ feature sets.

A middle-of-the road approach will likely work best in the long run.  E.g.

* Values and Keyframes: (value types, keyframe format, interpolation options)
* Transforms: 2D transforms, 3D transforms?
* Basic layers: null, solid, image, precomp
* Shape layers
* Text layers
* Fonts
* Advanced layers: camera, audio
* Basic effects: (common set of effects that can be supported in most players)
* Advanced effects: (fancy effects that may require e.g. custom shaders)


# Profiles

A ***profile*** is a group of supported limits, features, and formats that
specifies a set of Lottie player capabilities.

Profiles are useful for describing feature support across the heterogeneous
Lottie ecosystem, and for offering compatibility guarantees – e.g. *“LottieWeb
v1.2 supports the Core Profile v1.0 plus the following extensions: …”*.

Profiles can be defined in terms of individual features, or by referencing
existing modules or other profiles.  For the actual format, both a
human-readable version and a machine-parsable version are useful: the
human-readable version is informative for animation authors, helping them
constrain the design to the features available in the target profile, while
the machine-targeted version can be used for tooling (e.g. validation at export
time and at run time).

The Lottie community should offer a set of official profiles, with wide
applicability – e.g.

* **Baseline Profile** - A minimum set of features that should be supported by
                         any Lottie implementation.  Anything less cannot claim
                          Lottie compatibility.
* **Core Profile** - Representative, commonly supported features across
                     existing players.  Someone targeting the Core profile can
                     expect their assets to be supported on all major engines.
* **Embedded Profile**? - A reduced set of features that can be supported on
                          devices with limited graphics capabilities.

Organizations can publish their own profiles, in the same format, such that
they can be used with existing tools.  E.g.

* **Android Profile** - features supported in the official Android Framework space.
* **WearOS Profile** - features supported in the official WearOS stack.

Profile specification format: Unless there is a compelling reason, the profiles
format should follow the official Lottie spec format (JSON schema?).


# Sample Profiles

## Baseline Profile

Minimum set of features that should be supported by ***all*** Lottie players. 

| Feature         | Notes                                                     |
| --------------- | --------------------------------------------------------- |
|***Animation***                                                              |
|VERSION          |                                                           |
|FRAME RATE       |                                                           |
|IN/OUT POINT     |                                                           |
|WIDTH/HEIGHT     |                                                           |
|ASSETS           | Precomps only.                                            |
|                 |                                                           |
|***Animatable Values***                                                      |
|SCALAR           | Single float value, e.g. a rotation.                      |
|VEC2             | 2D value, e.g. a position or anisotropic scale.           |
|COLOR/VEC4       | Colors encoded as a float vector.                         |
|SHAPE            | Cubic Bezier paths.                                       |
|                 |                                                           |
|***Keyframes and Interpolation***                                            |
|HOLD             | Constant value.                                           |
|LINEAR           | Linear interpolation.                                     |
|CUBIC            | Cubic Bezier interpolation.                               |
|                 |                                                           |
|***2D Transforms***                                                          |
|ANCHOR POINT     |                                                           |
|POSITION         |                                                           |
|SCALE            |                                                           |
|ROTATION         |                                                           |
|SKEW             |                                                           |
|SKEW AXIS        |                                                           |
|OPACITY          |                                                           |
|                 |                                                           |
|***Basic Layers***                                                           |
|NULL LAYER       |                                                           |
|PRECOMP LAYER    |                                                           |
|SOLID LAYER      |                                                           |
|IN/OUT POINT     |                                                           |
|PARENTING        |                                                           |
|TIME STRETCH     |                                                           |
|                 |                                                           |
|***Shape Layer***                                                            |
|RECT             |                                                           |
|ELLIPSE          |                                                           |
|PATH             |                                                           |
|MERGE PATH       | *"Merge"* mode only.                                      |
|TRIM PATH        |                                                           |
|COLOR FILL       |                                                           |
|COLOR STROKE     |                                                           |
|GRADIENT FILL    |                                                           |
|GRADIENT STROKE  |                                                           |
|FILL RULE        |                                                           |
|GROUP            |                                                           |
|TRANSFORM        |                                                           |


## Core Profile

Common set of features that should be supported by ***most*** popular Lottie
players. 

| Feature         | Notes                                                     |
| --------------- | --------------------------------------------------------- |
|***Animation***                                                              |
|ASSETS           | Image assets.                                             |
|MARKERS          |                                                           |
|                 |                                                           |
|***Aimatable Values***                                                       |
|TEXT             | Text document keyframes.                                  |
|                 |                                                           |
|***Keyframes and Interpolation***                                            |
|SEPARATE DIMS    | Multi-dimensional values, separate KFs for each dimension.|
|SPATIAL          | Interpolation along a motion path.                        |
|                 |                                                           |
|***Basic Layers***                                                           |
|IMAGE LAYER      |                                                           |
|TRACK MATTE      |                                                           |
|MASKS            | Modes TBD.                                                |
|BLEND MODES      | Modes TBD.                                                |
|TIME REMAP       |                                                           |
|                 |                                                           |
|***Shape Layer***                                                            |
|POLYSTAR         |                                                           |
|MERGE PATH       | Advanced merge modes.                                     |
|REPEATER         |                                                           |
|                 |                                                           |
|***Text Layer***                                                             |
|EXTERNAL FONTS   |                                                           |
|POINT TEXT       |                                                           |
|PARAGRAPH TEXT   |                                                           |
|ALIGNMENT        | Horizontal alignment.                                     |
|FONT SIZE        |                                                           |
|LINE HEIGHT      |                                                           |
|LINE SHIFT       |                                                           |
|FILL COLOR       |                                                           |
|STROKE COLOR     |                                                           |
|STROKE WIDTH     |                                                           |


# Tooling

A machine-parsable format for profile definitions would enable the
implementation of various tools to help with asset validation.

**At design time:** designers need trusted feedback from their authoring tool
(eg AfterEffects + Bodymovin Plugin) on features supported or not supported
for a player or platform they are targeting.

**At run time:** platforms require concrete version support data and testing
of animations to ensure device compatibility. Test validation of animations
being shipped with the target supported profile is needed.


# References

* CSS [Levels, Snapshots, Modules](
https://www.w3.org/Style/2011/CSS-process.en.html
)
* Vulkan Proposals: [Extending Vulkan](
https://registry.khronos.org/vulkan/site/spec/latest/chapters/extensions.html
)
* Vulkan 1.3.x [Specification](
https://registry.khronos.org/vulkan/specs/1.3-extensions/html/vkspec.html#features-requirements
)
* Vulkan [Roadmap 2022](
https://www.khronos.org/blog/vulkan-1.3-and-roadmap-202
)
* Vulkan Blog [Profile Introduction](
https://www.khronos.org/news/press/vulkan-reduces-fragmentation-and-provides-roadmap-visibility-for-developers
)
* OpenGL ES [API](https://www.khronos.org/opengles/), [Registry](
https://registry.khronos.org/OpenGL/index_es.php
)
* Android [Compatibility Definition](
https://source.android.com/docs/compatibility/13/android-13-cdd
)
* Android [Baseline Profile](
https://developer.android.com/ndk/guides/graphics/android-baseline-profile
)
