import json

# Your input data
# from https://www.tints.dev/
# also: https://oklch.com/
data = {
    "colors": {
        "red": {
            50: "#FEF0F0",
            100: "#FEDEDE",
            200: "#FDC0C0",
            300: "#FC9B9C",
            400: "#FB7374",
            500: "#FB3F43",
            600: "#D4131B",
            700: "#A20C12",
            800: "#73060A",
            900: "#440203",
            950: "#300102",
        },
        "pink": {
            50: "#FEF0F4",
            100: "#FCDEE6",
            200: "#F9BFD0",
            300: "#F79BB7",
            400: "#F572A0",
            500: "#F33D8A",
            600: "#C6276D",
            700: "#971B52",
            800: "#6B1038",
            900: "#3F061E",
            950: "#2D0314",
        },
        "purple": {
            50: "#F7F1FE",
            100: "#EDE0FE",
            200: "#DDC4FD",
            300: "#CDA4FC",
            400: "#BE83FA",
            500: "#B25FF9",
            600: "#A01DEF",
            700: "#7914B7",
            800: "#550B83",
            900: "#31044D",
            950: "#220238",
        },
        "cyan": {
            50: "#E2F3FF",
            100: "#C1E8FF",
            200: "#78D4FF",
            300: "#00BCEF",
            400: "#00A1CD",
            500: "#0084A8",
            600: "#006987",
            700: "#005067",
            800: "#003749",
            900: "#001F2A",
            950: "#00131C",
        },
        "blue": {
            50: "#F1F3FF",
            100: "#E3E7FF",
            200: "#C2CCFF",
            300: "#A5B5FF",
            400: "#819BFF",
            500: "#5983FF",
            600: "#0063F1",
            700: "#004ABA",
            800: "#003181",
            900: "#001C50",
            950: "#001137",
        },
        "teal": {
            50: "#C1FBFF",
            100: "#79F8FF",
            200: "#00DFE7",
            300: "#00C4CB",
            400: "#00A7AD",
            500: "#008A8F",
            600: "#006C70",
            700: "#005255",
            800: "#00393B",
            900: "#002021",
            950: "#001415",
        },
        "green": {
            50: "#D1FFD7",
            100: "#A6FFB4",
            200: "#00F55C",
            300: "#00DF53",
            400: "#00C94A",
            500: "#00B140",
            600: "#008D31",
            700: "#006822",
            800: "#004614",
            900: "#002808",
            950: "#001804",
        },
        "yellow": {
            50: "#FFF5E5",
            100: "#FFEFD2",
            200: "#FFDF9A",
            300: "#FFCF2F",
            400: "#F0C100",
            500: "#E0B400",
            600: "#CFA600",
            700: "#BF9900",
            800: "#AF8C00",
            900: "#574500",
            950: "#302400",
        },
        "orange": {
            50: "#FFF0F0",
            100: "#FEDEDC",
            200: "#FEC0BB",
            300: "#FD9C93",
            400: "#FD7363",
            500: "#FA4515",
            600: "#C6350E",
            700: "#972608",
            800: "#6B1804",
            900: "#3E0A01",
            950: "#2D0501",
        },
    }
}


def transform_colors(input_dict):
    output = {}
    colors = input_dict.get("colors", {})

    for color_name, shades in colors.items():
        # Create a new dictionary for each color (e.g., orange)
        output[color_name] = {
            # Wrap each hex string in a { value: hex } object
            str(shade): {"value": hex_code}
            for shade, hex_code in shades.items()
        }
    return output


# Execute transformation
formatted_colors = transform_colors(data)

# Print as JSON-like string for easy copy-pasting
print(json.dumps(formatted_colors, indent=2))
