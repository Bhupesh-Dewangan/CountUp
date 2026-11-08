# CountUp - Advanced Multi-Calculator Suite

CountUp is a high-precision, multi-mode calculator and numerical utility suite engineered with pure Vanilla JavaScript (ES6+), HTML5, and CSS3. Designed with a modular architecture and clean neumorphic glassmorphism aesthetics, CountUp delivers seven specialized computational engines in a single, responsive web application without external frameworks or dependencies.

---

## Computational Engines & Modes

### 1. Standard Arithmetic Calculator
* **Dual-Line Display**: Real-time expression evaluation showing full equation history alongside computed results.
* **Floating-Point Precision**: Sanitized arithmetic preventing typical IEEE-754 precision anomalies (e.g., `0.1 + 0.2 = 0.3`).
* **Advanced Unary Operations**: Instant algebraic negation (`±`) and contextual percentage (`%`) computation.
* **Keyboard & Numpad Support**: Native bindings for numbers (`0-9`), operators (`+`, `-`, `*`, `/`), decimal (`.`), evaluate (`Enter`/`=`), backspace (`Backspace`), and clear (`Escape`).
* **Robust Error Shielding**: Prevents division by zero, invalid operator chaining, and chained calculations after error states.

### 2. Scientific Calculator
* **Trigonometric Functions**: Sine (`sin`), Cosine (`cos`), and Tangent (`tan`) with instantaneous Degree (`DEG`) and Radian (`RAD`) mode switching.
* **Secondary & Hyperbolic Modes**: Toggle `2nd` for inverse trigonometric functions (`asin`, `acos`, `atan`) and cube root (`cbrt`); toggle `hyp` for hyperbolic functions (`sinh`, `cosh`, `tanh`).
* **Combinatorics & Factorials**: Permutations (`nPr`), Combinations (`nCr`), and factorials (`n!`).
* **Logarithms & Exponentials**: Natural logarithm (`ln`), base-10 logarithm (`log`), powers (`x^y`), square roots (`sqrt`), and constants ($\pi$, $e$).
* **Parenthesis Expression Hierarchy**: Balanced bracket evaluation with automatic syntax closure upon evaluation.
* **History Recall**: Dedicated `Ans` register to reuse the last computed result across operations.

### 3. Programmer / Number Base Calculator
* **Real-Time 4-Base Monitor**: Synchronized quad-display simultaneously displaying values across Hexadecimal (`HEX`), Decimal (`DEC`), Octal (`OCT`), and Binary (`BIN`).
* **Arbitrary-Precision Bitwise Engine**: Built on JavaScript `BigInt` to prevent 32-bit truncation and precision degradation.
* **Bitwise Operations**: Bitwise `AND`, `OR`, `XOR`, `NOT`, Left Shift (`<<`), Right Shift (`>>`), and Modulo (`MOD`).
* **Word Size Architecture**: Cycle through 64-bit (`QWORD`), 32-bit (`DWORD`), 16-bit (`WORD`), and 8-bit (`BYTE`) with automatic bitmask truncation.
* **Dynamic Hex Keypad**: Context-aware enabling/disabling of hexadecimal keys (`A-F`) and numerals (`2-9`) based on the active base system.

### 4. Financial & Loan Calculator
* **Indian Rupee (₹) Locale**: All computations and monetary cards formatted with the Indian Rupee symbol (`₹`) and `en-IN` numbering system (lakhs and crores).
* **Loan / Mortgage EMI**: Equated Monthly Installment calculator with total interest and total repayment schedules.
* **SIP & Compound Wealth**: Systematic Investment Plan calculator projecting total investment, estimated returns, and total maturity wealth with annualized compounding.
* **GST & Sales Tax**: Inclusive and Exclusive tax calculation with instant percentage presets (`5%`, `12%`, `18%`, `28%`) and custom rates.

### 5. Unit & Measurement Converter
* **Multi-Category Coverage**: Instant conversion across 6 primary measurement domains:
  * **Length**: Millimeter, Centimeter, Meter, Kilometer, Inch, Foot, Yard, Mile.
  * **Mass / Weight**: Milligram, Gram, Kilogram, Metric Ton, Ounce, Pound.
  * **Volume**: Liter, Milliliter, Cubic Meter, Gallon, Quart, Pint, Cup, Fluid Ounce.
  * **Temperature**: Celsius, Fahrenheit, Kelvin (with exact affine formulas).
  * **Digital Data**: Byte, Kilobyte, Megabyte, Gigabyte, Terabyte, Petabyte (base 1024).
  * **Speed**: Meters per second, Kilometers per hour, Miles per hour, Knots.
* **Reactive Two-Way Binding**: Real-time synchronization updating the opposing field regardless of which direction is edited.
* **Quick Unit Swap**: One-click orientation reversal with smooth icon animation.
* **Live Conversion Formula**: Contextual mathematical rate card display.

### 6. Date & Age Calculator
* **Chronological Age Calculator**: Exact chronological age breakdown in Years, Months, and Days, alongside cumulative statistics (total months, weeks, calendar days).
* **Next Birthday Countdown**: Days remaining until the next anniversary with day-of-week projection.
* **Date Difference Engine**: Accurate calendar duration measurement between any two points in time, including Calendar Days, Weeks, Business Days (excluding weekends), and Weekend Days.
* **Duration Projector**: Add or subtract customizable years, months, and days from any date with automatic month-end and leap-year clamping.

### 7. Health & Fitness (BMI) Calculator
* **Dual Unit Systems**: Seamless real-time conversion between Metric (`cm`, `kg`) and Imperial (`ft`/`in`, `lbs`) unit systems.
* **WHO Classification**: Standardized body mass index categorization across Underweight, Normal Weight, Overweight, and Obese brackets.
* **Segmented Range Gauge**: Visual four-stage gauge meter with dynamic needle positioning mapped to calculated BMI scores.
* **Ideal Weight Range**: Target weight interval projection based on standard healthy BMI bounds (`18.5 - 24.9`).
* **Health Guidance**: Personalized weight surplus/deficit feedback and BMI Prime ratio calculations.

---

## User Interface & Design System

* **Responsive Pro Studio Architecture**: Fluid, multi-tier layout automatically adapting between Mobile (< 640px), Tablet (640px - 1023px), Desktop Workstation (1024px - 1439px), and Ultra-wide (>= 1440px).
* **Desktop Mode Navigation Bar**: Direct-access horizontal pill navigation strip on screens >= 1024px with keyboard shortcuts (`Alt+1` through `Alt+7`).
* **Split-Pane Master-Detail Views**: Dedicated 2-column layouts for Financial (EMI, SIP, GST), Date Interval analytics, and BMI health dashboard on desktop viewports.
* **Unit Converter Horizontal Bridge**: Bidirectional conversion bridge with centered unit swap mechanics.
* **Dockable Calculation History Tape**: On desktop viewports, calculation history transitions into an ergonomic docked right-hand sidebar alongside the active calculator with real-time updates and one-click recall; togglable via `Alt+H` or the history icon with state persistence in `localStorage`.
* **Keyboard Shortcuts Cheatsheet & Badges**: Interactive shortcuts dialog accessible via `Alt+?` or header button, paired with inline shortcut badges across mode tabs.
* **Fluid Typography & Sizing**: Built using modern CSS `clamp()` functions for seamless readability and touch/click ergonomics across all display densities.
* **One-Click Clipboard Copying**: Quick copy button on displays with animated floating toast notification feedback.
* **Theme Switching**: Dark and Light themes with dynamic CSS variables and state persistence via `localStorage`.
* **Zero Emojis**: 100% stroke-based SVG vector icons for a consistent, professional design language.

---

## Project Structure

```
CountUp/
├── index.html        # Semantic HTML5 markup containing all 7 mode views
├── style.css         # Modern CSS3 styling, CSS variables, and layout systems
├── app.js            # Vanilla JavaScript modular calculation engines and router
└── README.md         # Comprehensive project documentation
```

---

## Getting Started

Because CountUp relies solely on standard web technologies without external dependencies, no installation or compilation step is required.

1. Clone the repository:
   ```bash
   git clone https://github.com/Bhupesh-Dewangan/CountUp.git
   ```
2. Open `index.html` in any modern web browser, or launch using a local static file server:
   ```bash
   npx serve .
   ```

---

## Technical Highlights

* **Pure Vanilla JS**: Zero reliance on runtime frameworks or external libraries.
* **State Management**: Clean local state machines per computational view with isolated event listeners.
* **Accessibility**: Proper ARIA labels, semantic buttons, and keyboard navigation support.
* **Cross-Browser Compatibility**: Compatible with modern Chrome, Firefox, Safari, and Edge.
