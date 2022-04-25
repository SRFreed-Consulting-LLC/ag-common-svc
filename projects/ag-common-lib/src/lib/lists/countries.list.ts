const COUNTRIES = [
        {
            "id": "27945c8c-d478-11e4-bfe7-22000abfab1d",
            "name": "Afghanistan",
            "code": "AF"
        },
        {
            "id": "27945ec6-d478-11e4-bfe7-22000abfab1d",
            "name": "Albania",
            "code": "AL"
        },
        {
            "id": "27945d54-d478-11e4-bfe7-22000abfab1d",
            "name": "Algeria",
            "code": "AG"
        },
        {
            "id": "27946060-d478-11e4-bfe7-22000abfab1d",
            "name": "Andorra",
            "code": "AN"
        },
        {
            "id": "2794610a-d478-11e4-bfe7-22000abfab1d",
            "name": "Angola",
            "code": "AO"
        },
        {
            "id": "27945778-d478-11e4-bfe7-22000abfab1d",
            "name": "Antigua and Barbuda",
            "code": "AC"
        },
        {
            "id": "279461be-d478-11e4-bfe7-22000abfab1d",
            "name": "Argentina",
            "code": "AR"
        },
        {
            "id": "27945fac-d478-11e4-bfe7-22000abfab1d",
            "name": "Armenia",
            "code": "AM"
        },
        {
            "id": "2794b286-d478-11e4-bfe7-22000abfab1d",
            "name": "Aruba",
            "code": "NL"
        },
        {
            "id": "27946268-d478-11e4-bfe7-22000abfab1d",
            "name": "Australia",
            "code": "AS"
        },
        {
            "id": "27946308-d478-11e4-bfe7-22000abfab1d",
            "name": "Austria",
            "code": "AU"
        },
        {
            "id": "27945e12-d478-11e4-bfe7-22000abfab1d",
            "name": "Azerbaijan",
            "code": "AJ"
        },
        {
            "id": "27946768-d478-11e4-bfe7-22000abfab1d",
            "name": "Bahamas, The",
            "code": "BF"
        },
        {
            "id": "279463b2-d478-11e4-bfe7-22000abfab1d",
            "name": "Bahrain",
            "code": "BA"
        },
        {
            "id": "2794681c-d478-11e4-bfe7-22000abfab1d",
            "name": "Bangladesh",
            "code": "BG"
        },
        {
            "id": "27946434-d478-11e4-bfe7-22000abfab1d",
            "name": "Barbados",
            "code": "BB"
        },
        {
            "id": "27946b1e-d478-11e4-bfe7-22000abfab1d",
            "name": "Belarus",
            "code": "BO"
        },
        {
            "id": "27946538-d478-11e4-bfe7-22000abfab1d",
            "name": "Belgium",
            "code": "BE"
        },
        {
            "id": "2794689e-d478-11e4-bfe7-22000abfab1d",
            "name": "Belize",
            "code": "BH"
        },
        {
            "id": "27946aa6-d478-11e4-bfe7-22000abfab1d",
            "name": "Benin",
            "code": "BN"
        },
        {
            "id": "27946cfe-d478-11e4-bfe7-22000abfab1d",
            "name": "Bhutan",
            "code": "BT"
        },
        {
            "id": "279469a2-d478-11e4-bfe7-22000abfab1d",
            "name": "Bolivia",
            "code": "BL"
        },
        {
            "id": "27946920-d478-11e4-bfe7-22000abfab1d",
            "name": "Bosnia and Herzegovi",
            "code": "BK"
        },
        {
            "id": "279464b6-d478-11e4-bfe7-22000abfab1d",
            "name": "Botswana",
            "code": "BC"
        },
        {
            "id": "27946c72-d478-11e4-bfe7-22000abfab1d",
            "name": "Brazil",
            "code": "BR"
        },
        {
            "id": "27946df8-d478-11e4-bfe7-22000abfab1d",
            "name": "Brunei",
            "code": "BX"
        },
        {
            "id": "27946d76-d478-11e4-bfe7-22000abfab1d",
            "name": "Bulgaria",
            "code": "BU"
        },
        {
            "id": "2794d9be-d478-11e4-bfe7-22000abfab1d",
            "name": "Burkina Faso",
            "code": "UV"
        },
        {
            "id": "27946a24-d478-11e4-bfe7-22000abfab1d",
            "name": "Burma",
            "code": "BM"
        },
        {
            "id": "27946e70-d478-11e4-bfe7-22000abfab1d",
            "name": "Burundi",
            "code": "BY"
        },
        {
            "id": "2794700a-d478-11e4-bfe7-22000abfab1d",
            "name": "Cambodia",
            "code": "CB"
        },
        {
            "id": "27947370-d478-11e4-bfe7-22000abfab1d",
            "name": "Cameroon",
            "code": "CM"
        },
        {
            "id": "27946ef2-d478-11e4-bfe7-22000abfab1d",
            "name": "Canada",
            "code": "CA"
        },
        {
            "id": "27947668-d478-11e4-bfe7-22000abfab1d",
            "name": "Cape Verde",
            "code": "CV"
        },
        {
            "id": "27946f7e-d478-11e4-bfe7-22000abfab1d",
            "name": "Central African Repu",
            "code": "CAR"
        },
        {
            "id": "27947082-d478-11e4-bfe7-22000abfab1d",
            "name": "Chad",
            "code": "CD"
        },
        {
            "id": "279472f8-d478-11e4-bfe7-22000abfab1d",
            "name": "Chile",
            "code": "CI"
        },
        {
            "id": "27947280-d478-11e4-bfe7-22000abfab1d",
            "name": "China",
            "code": "CH"
        },
        {
            "id": "2794746a-d478-11e4-bfe7-22000abfab1d",
            "name": "Colombia",
            "code": "CO"
        },
        {
            "id": "279473f2-d478-11e4-bfe7-22000abfab1d",
            "name": "Comoros",
            "code": "CN"
        },
        {
            "id": "279471fe-d478-11e4-bfe7-22000abfab1d",
            "name": "Congo, Democratic Re",
            "code": "CG"
        },
        {
            "id": "2794717c-d478-11e4-bfe7-22000abfab1d",
            "name": "Congo, Republic of t",
            "code": "CF"
        },
        {
            "id": "279474ec-d478-11e4-bfe7-22000abfab1d",
            "name": "Costa Rica",
            "code": "CS"
        },
        {
            "id": "27948b4e-d478-11e4-bfe7-22000abfab1d",
            "name": "Cote d'Ivoire",
            "code": "IV"
        },
        {
            "id": "27948752-d478-11e4-bfe7-22000abfab1d",
            "name": "Croatia",
            "code": "HR"
        },
        {
            "id": "27947564-d478-11e4-bfe7-22000abfab1d",
            "name": "Cuba",
            "code": "CU"
        },
        {
            "id": "279475e6-d478-11e4-bfe7-22000abfab1d",
            "name": "Curacao",
            "code": "CUR"
        },
        {
            "id": "2794779e-d478-11e4-bfe7-22000abfab1d",
            "name": "Cyprus",
            "code": "CY"
        },
        {
            "id": "27947e42-d478-11e4-bfe7-22000abfab1d",
            "name": "Czech Republic",
            "code": "EZ"
        },
        {
            "id": "27947852-d478-11e4-bfe7-22000abfab1d",
            "name": "Denmark",
            "code": "DA"
        },
        {
            "id": "279478d4-d478-11e4-bfe7-22000abfab1d",
            "name": "Djibouti",
            "code": "DJ"
        },
        {
            "id": "2794794c-d478-11e4-bfe7-22000abfab1d",
            "name": "Dominica",
            "code": "DO"
        },
        {
            "id": "279479ce-d478-11e4-bfe7-22000abfab1d",
            "name": "Dominican Republic",
            "code": "DR"
        },
        {
            "id": "27947a50-d478-11e4-bfe7-22000abfab1d",
            "name": "Ecuador",
            "code": "EC"
        },
        {
            "id": "27947ad2-d478-11e4-bfe7-22000abfab1d",
            "name": "Egypt",
            "code": "EG"
        },
        {
            "id": "27947d48-d478-11e4-bfe7-22000abfab1d",
            "name": "El Salvador",
            "code": "ES"
        },
        {
            "id": "27947bcc-d478-11e4-bfe7-22000abfab1d",
            "name": "Equatorial Guinea",
            "code": "EK"
        },
        {
            "id": "27947cc6-d478-11e4-bfe7-22000abfab1d",
            "name": "Eritrea",
            "code": "ER"
        },
        {
            "id": "27947c4e-d478-11e4-bfe7-22000abfab1d",
            "name": "Estonia",
            "code": "EN"
        },
        {
            "id": "27947dc0-d478-11e4-bfe7-22000abfab1d",
            "name": "Ethiopia",
            "code": "ET"
        },
        {
            "id": "27947f50-d478-11e4-bfe7-22000abfab1d",
            "name": "Fiji",
            "code": "FJ"
        },
        {
            "id": "27947ec4-d478-11e4-bfe7-22000abfab1d",
            "name": "Finland",
            "code": "FI"
        },
        {
            "id": "27948054-d478-11e4-bfe7-22000abfab1d",
            "name": "France",
            "code": "FR"
        },
        {
            "id": "2794814e-d478-11e4-bfe7-22000abfab1d",
            "name": "Gabon",
            "code": "GB"
        },
        {
            "id": "279480cc-d478-11e4-bfe7-22000abfab1d",
            "name": "Gambia, The",
            "code": "GA"
        },
        {
            "id": "279481d0-d478-11e4-bfe7-22000abfab1d",
            "name": "Georgia",
            "code": "GG"
        },
        {
            "id": "27948342-d478-11e4-bfe7-22000abfab1d",
            "name": "Germany",
            "code": "GM"
        },
        {
            "id": "27948248-d478-11e4-bfe7-22000abfab1d",
            "name": "Ghana",
            "code": "GH"
        },
        {
            "id": "279483ba-d478-11e4-bfe7-22000abfab1d",
            "name": "Greece",
            "code": "GR"
        },
        {
            "id": "279482c0-d478-11e4-bfe7-22000abfab1d",
            "name": "Grenada",
            "code": "GJ"
        },
        {
            "id": "27948432-d478-11e4-bfe7-22000abfab1d",
            "name": "Guatemala",
            "code": "GT"
        },
        {
            "id": "279484b4-d478-11e4-bfe7-22000abfab1d",
            "name": "Guinea",
            "code": "GV"
        },
        {
            "id": "2794bb1e-d478-11e4-bfe7-22000abfab1d",
            "name": "Guinea-Bissau",
            "code": "PU"
        },
        {
            "id": "27948540-d478-11e4-bfe7-22000abfab1d",
            "name": "Guyana",
            "code": "GY"
        },
        {
            "id": "279485c2-d478-11e4-bfe7-22000abfab1d",
            "name": "Haiti",
            "code": "HA"
        },
        {
            "id": "2794e6f2-d478-11e4-bfe7-22000abfab1d",
            "name": "Holy See",
            "code": "VT"
        },
        {
            "id": "279486c6-d478-11e4-bfe7-22000abfab1d",
            "name": "Honduras",
            "code": "HO"
        },
        {
            "id": "27948644-d478-11e4-bfe7-22000abfab1d",
            "name": "Hong Kong",
            "code": "HK"
        },
        {
            "id": "279487de-d478-11e4-bfe7-22000abfab1d",
            "name": "Hungary",
            "code": "HU"
        },
        {
            "id": "27948856-d478-11e4-bfe7-22000abfab1d",
            "name": "Iceland",
            "code": "IC"
        },
        {
            "id": "2794895a-d478-11e4-bfe7-22000abfab1d",
            "name": "India",
            "code": "IN"
        },
        {
            "id": "279488d8-d478-11e4-bfe7-22000abfab1d",
            "name": "Indonesia",
            "code": "ID"
        },
        {
            "id": "279489d2-d478-11e4-bfe7-22000abfab1d",
            "name": "Iran",
            "code": "IR"
        },
        {
            "id": "27948bd0-d478-11e4-bfe7-22000abfab1d",
            "name": "Iraq",
            "code": "IZ"
        },
        {
            "id": "27947b4a-d478-11e4-bfe7-22000abfab1d",
            "name": "Ireland",
            "code": "EI"
        },
        {
            "id": "27948a54-d478-11e4-bfe7-22000abfab1d",
            "name": "Israel",
            "code": "IS"
        },
        {
            "id": "27948ad6-d478-11e4-bfe7-22000abfab1d",
            "name": "Italy",
            "code": "IT"
        },
        {
            "id": "27948cca-d478-11e4-bfe7-22000abfab1d",
            "name": "Jamaica",
            "code": "JM"
        },
        {
            "id": "27948c52-d478-11e4-bfe7-22000abfab1d",
            "name": "Japan",
            "code": "JA"
        },
        {
            "id": "27948d4c-d478-11e4-bfe7-22000abfab1d",
            "name": "Jordan",
            "code": "JO"
        },
        {
            "id": "2794915c-d478-11e4-bfe7-22000abfab1d",
            "name": "Kazakhstan",
            "code": "KZ"
        },
        {
            "id": "27948dce-d478-11e4-bfe7-22000abfab1d",
            "name": "Kenya",
            "code": "KE"
        },
        {
            "id": "27948f5e-d478-11e4-bfe7-22000abfab1d",
            "name": "Kiribati",
            "code": "KR"
        },
        {
            "id": "27948ec8-d478-11e4-bfe7-22000abfab1d",
            "name": "Korea, North",
            "code": "KN"
        },
        {
            "id": "27948fe0-d478-11e4-bfe7-22000abfab1d",
            "name": "Korea, South",
            "code": "KS"
        },
        {
            "id": "279490da-d478-11e4-bfe7-22000abfab1d",
            "name": "Kosovo",
            "code": "KV"
        },
        {
            "id": "27949062-d478-11e4-bfe7-22000abfab1d",
            "name": "Kuwait",
            "code": "KU"
        },
        {
            "id": "27948e50-d478-11e4-bfe7-22000abfab1d",
            "name": "Kyrgyzstan",
            "code": "KG"
        },
        {
            "id": "279491d4-d478-11e4-bfe7-22000abfab1d",
            "name": "Laos",
            "code": "LA"
        },
        {
            "id": "279492ce-d478-11e4-bfe7-22000abfab1d",
            "name": "Latvia",
            "code": "LG"
        },
        {
            "id": "27949256-d478-11e4-bfe7-22000abfab1d",
            "name": "Lebanon",
            "code": "LE"
        },
        {
            "id": "27949ada-d478-11e4-bfe7-22000abfab1d",
            "name": "Lesotho",
            "code": "LT"
        },
        {
            "id": "279493c8-d478-11e4-bfe7-22000abfab1d",
            "name": "Liberia",
            "code": "LI"
        },
        {
            "id": "27949bf2-d478-11e4-bfe7-22000abfab1d",
            "name": "Libya",
            "code": "LY"
        },
        {
            "id": "27949a26-d478-11e4-bfe7-22000abfab1d",
            "name": "Liechtenstein",
            "code": "LS"
        },
        {
            "id": "27949350-d478-11e4-bfe7-22000abfab1d",
            "name": "Lithuania",
            "code": "LH"
        },
        {
            "id": "27949b5c-d478-11e4-bfe7-22000abfab1d",
            "name": "Luxembourg",
            "code": "LU"
        },
        {
            "id": "27949d1e-d478-11e4-bfe7-22000abfab1d",
            "name": "Macau",
            "code": "MAC"
        },
        {
            "id": "2794a732-d478-11e4-bfe7-22000abfab1d",
            "name": "Macedonia",
            "code": "MK"
        },
        {
            "id": "27949c7e-d478-11e4-bfe7-22000abfab1d",
            "name": "Madagascar",
            "code": "MA"
        },
        {
            "id": "2794a020-d478-11e4-bfe7-22000abfab1d",
            "name": "Malawi",
            "code": "MI"
        },
        {
            "id": "2794ae1c-d478-11e4-bfe7-22000abfab1d",
            "name": "Malaysia",
            "code": "MY"
        },
        {
            "id": "2794ad04-d478-11e4-bfe7-22000abfab1d",
            "name": "Maldives",
            "code": "MV"
        },
        {
            "id": "2794a7b4-d478-11e4-bfe7-22000abfab1d",
            "name": "Mali",
            "code": "ML"
        },
        {
            "id": "2794abec-d478-11e4-bfe7-22000abfab1d",
            "name": "Malta",
            "code": "MT"
        },
        {
            "id": "2794bcb8-d478-11e4-bfe7-22000abfab1d",
            "name": "Marshall Islands",
            "code": "RM"
        },
        {
            "id": "2794ab60-d478-11e4-bfe7-22000abfab1d",
            "name": "Mauritania",
            "code": "MR"
        },
        {
            "id": "2794aade-d478-11e4-bfe7-22000abfab1d",
            "name": "Mauritius",
            "code": "MP"
        },
        {
            "id": "2794ad90-d478-11e4-bfe7-22000abfab1d",
            "name": "Mexico",
            "code": "MX"
        },
        {
            "id": "27947fd2-d478-11e4-bfe7-22000abfab1d",
            "name": "Micronesia",
            "code": "FM"
        },
        {
            "id": "27949daa-d478-11e4-bfe7-22000abfab1d",
            "name": "Moldova",
            "code": "MD"
        },
        {
            "id": "2794a82c-d478-11e4-bfe7-22000abfab1d",
            "name": "Monaco",
            "code": "MN"
        },
        {
            "id": "27949e36-d478-11e4-bfe7-22000abfab1d",
            "name": "Mongolia",
            "code": "MG"
        },
        {
            "id": "2794a692-d478-11e4-bfe7-22000abfab1d",
            "name": "Montenegro",
            "code": "MJ"
        },
        {
            "id": "2794aa34-d478-11e4-bfe7-22000abfab1d",
            "name": "Morocco",
            "code": "MO"
        },
        {
            "id": "2794aebc-d478-11e4-bfe7-22000abfab1d",
            "name": "Mozambique",
            "code": "MZ"
        },
        {
            "id": "2794e7ce-d478-11e4-bfe7-22000abfab1d",
            "name": "Namibia",
            "code": "WA"
        },
        {
            "id": "2794b420-d478-11e4-bfe7-22000abfab1d",
            "name": "Nauru",
            "code": "NR"
        },
        {
            "id": "2794b394-d478-11e4-bfe7-22000abfab1d",
            "name": "Nepal",
            "code": "NP"
        },
        {
            "id": "2794afd4-d478-11e4-bfe7-22000abfab1d",
            "name": "Netherlands",
            "code": "NE"
        },
        {
            "id": "2794af48-d478-11e4-bfe7-22000abfab1d",
            "name": "Netherlands Antilles",
            "code": "NA"
        },
        {
            "id": "2794b5ba-d478-11e4-bfe7-22000abfab1d",
            "name": "New Zealand",
            "code": "NZ"
        },
        {
            "id": "2794b52e-d478-11e4-bfe7-22000abfab1d",
            "name": "Nicaragua",
            "code": "NU"
        },
        {
            "id": "2794b060-d478-11e4-bfe7-22000abfab1d",
            "name": "Niger",
            "code": "NG"
        },
        {
            "id": "2794b16e-d478-11e4-bfe7-22000abfab1d",
            "name": "Nigeria",
            "code": "NI"
        },
        {
            "id": "2794b1fa-d478-11e4-bfe7-22000abfab1d",
            "name": "North Korea",
            "code": "NK"
        },
        {
            "id": "2794b308-d478-11e4-bfe7-22000abfab1d",
            "name": "Norway",
            "code": "NO"
        },
        {
            "id": "2794ac78-d478-11e4-bfe7-22000abfab1d",
            "name": "Oman",
            "code": "MU"
        },
        {
            "id": "2794b768-d478-11e4-bfe7-22000abfab1d",
            "name": "Pakistan",
            "code": "PK"
        },
        {
            "id": "2794ba06-d478-11e4-bfe7-22000abfab1d",
            "name": "Palau",
            "code": "PS"
        },
        {
            "id": "2794ba92-d478-11e4-bfe7-22000abfab1d",
            "name": "Palestinian Territor",
            "code": "PT"
        },
        {
            "id": "2794b86c-d478-11e4-bfe7-22000abfab1d",
            "name": "Panama",
            "code": "PM"
        },
        {
            "id": "2794b984-d478-11e4-bfe7-22000abfab1d",
            "name": "Papua New Guinea",
            "code": "PP"
        },
        {
            "id": "2794b63c-d478-11e4-bfe7-22000abfab1d",
            "name": "Paraguay",
            "code": "PA"
        },
        {
            "id": "2794b6dc-d478-11e4-bfe7-22000abfab1d",
            "name": "Peru",
            "code": "PE"
        },
        {
            "id": "2794bdc6-d478-11e4-bfe7-22000abfab1d",
            "name": "Philippines",
            "code": "RP"
        },
        {
            "id": "2794b7ea-d478-11e4-bfe7-22000abfab1d",
            "name": "Poland",
            "code": "PL"
        },
        {
            "id": "2794b8f8-d478-11e4-bfe7-22000abfab1d",
            "name": "Portugal",
            "code": "PO"
        },
        {
            "id": "2794bbaa-d478-11e4-bfe7-22000abfab1d",
            "name": "Qatar",
            "code": "QA"
        },
        {
            "id": "2794bd3a-d478-11e4-bfe7-22000abfab1d",
            "name": "Romania",
            "code": "RO"
        },
        {
            "id": "2794be52-d478-11e4-bfe7-22000abfab1d",
            "name": "Russia",
            "code": "RS"
        },
        {
            "id": "2794bee8-d478-11e4-bfe7-22000abfab1d",
            "name": "Rwanda",
            "code": "RW"
        },
        {
            "id": "2794bff6-d478-11e4-bfe7-22000abfab1d",
            "name": "Saint Kitts and Nevi",
            "code": "SC"
        },
        {
            "id": "2794cd20-d478-11e4-bfe7-22000abfab1d",
            "name": "Saint Lucia",
            "code": "ST"
        },
        {
            "id": "2794ddba-d478-11e4-bfe7-22000abfab1d",
            "name": "Saint Vincent and th",
            "code": "VC"
        },
        {
            "id": "2794e864-d478-11e4-bfe7-22000abfab1d",
            "name": "Samoa",
            "code": "WS"
        },
        {
            "id": "2794c438-d478-11e4-bfe7-22000abfab1d",
            "name": "San Marino",
            "code": "SM"
        },
        {
            "id": "2794d3ba-d478-11e4-bfe7-22000abfab1d",
            "name": "Sao Tome and Princip",
            "code": "TP"
        },
        {
            "id": "2794bf74-d478-11e4-bfe7-22000abfab1d",
            "name": "Saudi Arabia",
            "code": "SA"
        },
        {
            "id": "2794c190-d478-11e4-bfe7-22000abfab1d",
            "name": "Senegal",
            "code": "SG"
        },
        {
            "id": "2794bc2c-d478-11e4-bfe7-22000abfab1d",
            "name": "Serbia",
            "code": "RI"
        },
        {
            "id": "2794c082-d478-11e4-bfe7-22000abfab1d",
            "name": "Seychelles",
            "code": "SE"
        },
        {
            "id": "2794c3ac-d478-11e4-bfe7-22000abfab1d",
            "name": "Sierra Leone",
            "code": "SL"
        },
        {
            "id": "2794c4ba-d478-11e4-bfe7-22000abfab1d",
            "name": "Singapore",
            "code": "SN"
        },
        {
            "id": "2794c29e-d478-11e4-bfe7-22000abfab1d",
            "name": "Sint Maarten",
            "code": "SIN"
        },
        {
            "id": "27949440-d478-11e4-bfe7-22000abfab1d",
            "name": "Slovakia",
            "code": "LO"
        },
        {
            "id": "2794c212-d478-11e4-bfe7-22000abfab1d",
            "name": "Slovenia",
            "code": "SI"
        },
        {
            "id": "27946ba0-d478-11e4-bfe7-22000abfab1d",
            "name": "Solomon Islands",
            "code": "BP"
        },
        {
            "id": "2794c546-d478-11e4-bfe7-22000abfab1d",
            "name": "Somalia",
            "code": "SO"
        },
        {
            "id": "2794c104-d478-11e4-bfe7-22000abfab1d",
            "name": "South Africa",
            "code": "SF"
        },
        {
            "id": "2794c32a-d478-11e4-bfe7-22000abfab1d",
            "name": "South Korea",
            "code": "SK"
        },
        {
            "id": "2794c654-d478-11e4-bfe7-22000abfab1d",
            "name": "South Sudan",
            "code": "SS"
        },
        {
            "id": "2794c5c8-d478-11e4-bfe7-22000abfab1d",
            "name": "Spain",
            "code": "SP"
        },
        {
            "id": "27947104-d478-11e4-bfe7-22000abfab1d",
            "name": "Sri Lanka",
            "code": "CE"
        },
        {
            "id": "2794cdd4-d478-11e4-bfe7-22000abfab1d",
            "name": "Sudan",
            "code": "SU"
        },
        {
            "id": "2794b4a2-d478-11e4-bfe7-22000abfab1d",
            "name": "Suriname",
            "code": "NS"
        },
        {
            "id": "2794e8f0-d478-11e4-bfe7-22000abfab1d",
            "name": "Swaziland",
            "code": "WZ"
        },
        {
            "id": "2794ce60-d478-11e4-bfe7-22000abfab1d",
            "name": "Sweden",
            "code": "SW"
        },
        {
            "id": "2794cf78-d478-11e4-bfe7-22000abfab1d",
            "name": "Switzerland",
            "code": "SZ"
        },
        {
            "id": "2794ceec-d478-11e4-bfe7-22000abfab1d",
            "name": "Syria",
            "code": "SY"
        },
        {
            "id": "2794d004-d478-11e4-bfe7-22000abfab1d",
            "name": "Taiwan",
            "code": "TAI"
        },
        {
            "id": "2794d19e-d478-11e4-bfe7-22000abfab1d",
            "name": "Tajikistan",
            "code": "TI"
        },
        {
            "id": "2794d70c-d478-11e4-bfe7-22000abfab1d",
            "name": "Tanzania",
            "code": "TZ"
        },
        {
            "id": "2794d112-d478-11e4-bfe7-22000abfab1d",
            "name": "Thailand",
            "code": "TH"
        },
        {
            "id": "2794d220-d478-11e4-bfe7-22000abfab1d",
            "name": "Timor-Leste",
            "code": "TL"
        },
        {
            "id": "2794d4d2-d478-11e4-bfe7-22000abfab1d",
            "name": "Timor-Leste",
            "code": "TT"
        },
        {
            "id": "2794d338-d478-11e4-bfe7-22000abfab1d",
            "name": "Togo",
            "code": "TO"
        },
        {
            "id": "2794d2ac-d478-11e4-bfe7-22000abfab1d",
            "name": "Tonga",
            "code": "TN"
        },
        {
            "id": "2794d086-d478-11e4-bfe7-22000abfab1d",
            "name": "Trinidad and Tobago",
            "code": "TD"
        },
        {
            "id": "2794d446-d478-11e4-bfe7-22000abfab1d",
            "name": "Tunisia",
            "code": "TS"
        },
        {
            "id": "2794d572-d478-11e4-bfe7-22000abfab1d",
            "name": "Turkey",
            "code": "TU"
        },
        {
            "id": "2794d68a-d478-11e4-bfe7-22000abfab1d",
            "name": "Turkmenistan",
            "code": "TX"
        },
        {
            "id": "2794d5fe-d478-11e4-bfe7-22000abfab1d",
            "name": "Tuvalu",
            "code": "TV"
        },
        {
            "id": "2794d798-d478-11e4-bfe7-22000abfab1d",
            "name": "Uganda",
            "code": "UG"
        },
        {
            "id": "2794d8b0-d478-11e4-bfe7-22000abfab1d",
            "name": "Ukraine",
            "code": "UP"
        },
        {
            "id": "27945b88-d478-11e4-bfe7-22000abfab1d",
            "name": "United Arab Emirates",
            "code": "AE"
        },
        {
            "id": "2794d824-d478-11e4-bfe7-22000abfab1d",
            "name": "United Kingdom",
            "code": "UK"
        },
        {
            "id": "2794d932-d478-11e4-bfe7-22000abfab1d",
            "name": "United States",
            "code": "US"
        },
        {
            "id": "2794da4a-d478-11e4-bfe7-22000abfab1d",
            "name": "Uruguay",
            "code": "UY"
        },
        {
            "id": "2794dc02-d478-11e4-bfe7-22000abfab1d",
            "name": "Uzbekistan",
            "code": "UZ"
        },
        {
            "id": "2794b0ec-d478-11e4-bfe7-22000abfab1d",
            "name": "Vanuatu",
            "code": "NH"
        },
        {
            "id": "2794de8c-d478-11e4-bfe7-22000abfab1d",
            "name": "Venezuela",
            "code": "VE"
        },
        {
            "id": "2794e60c-d478-11e4-bfe7-22000abfab1d",
            "name": "Vietnam",
            "code": "VM"
        },
        {
            "id": "2794e97c-d478-11e4-bfe7-22000abfab1d",
            "name": "Yemen",
            "code": "YM"
        },
        {
            "id": "2794e9fe-d478-11e4-bfe7-22000abfab1d",
            "name": "Zambia",
            "code": "ZA"
        },
        {
            "id": "2794ea94-d478-11e4-bfe7-22000abfab1d",
            "name": "Zimbabwe",
            "code": "ZI"
        }
    ];

    export { COUNTRIES };
