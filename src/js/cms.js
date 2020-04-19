import React from "react";
import CMS from "netlify-cms-app";

// Import main site styles as a string to inject into the CMS preview pane
import styles from "!to-string-loader!css-loader!postcss-loader!sass-loader!../css/main.css";

import HomePreview from "./cms-preview-templates/home";
import StepPreview from "./cms-preview-templates/step";

CMS.registerPreviewStyle(styles, { raw: true });
CMS.registerPreviewTemplate("home", HomePreview);
CMS.registerPreviewTemplate("step", StepPreview);
CMS.init();
