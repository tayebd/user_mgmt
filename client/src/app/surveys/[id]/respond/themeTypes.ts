/**
 * Type definition for SurveyJS theme object
 * This matches the ITheme interface from the SurveyJS library
 */

// Define the alignment types used by SurveyJS
type HorizontalAlignment = "left" | "center" | "right";
type VerticalAlignment = "top" | "middle" | "bottom";

export interface SurveyTheme {
  backgroundOpacity?: number;
  isPanelless?: boolean;
  cssVariables?: Record<string, string>;
  themeName?: string;
  colorPalette?: string;
  header?: {
    height?: number;
    inheritWidthFrom?: "survey" | "container";
    textAreaWidth?: number;
    overlapEnabled?: boolean;
    backgroundImageOpacity?: number;
    backgroundImageFit?: "cover" | "fill" | "contain" | "tile";
    logoPositionX?: HorizontalAlignment;
    logoPositionY?: VerticalAlignment;
    titlePositionX?: HorizontalAlignment;
    titlePositionY?: VerticalAlignment;
    descriptionPositionX?: HorizontalAlignment;
    descriptionPositionY?: VerticalAlignment;
  };
  headerView?: "advanced" | "basic";
}

/**
 * Type definition for SurveyJS custom CSS
 */
export interface SurveyCustomCss {
  footer?: string;
  imagepicker?: Record<string, string>;
  radiogroup?: Record<string, string>;
  checkbox?: Record<string, string>;
  [key: string]: unknown;
}
