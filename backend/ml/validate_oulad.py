from pathlib import Path
import pandas as pd


# --------------------------------------------------
# OULAD DATASET VALIDATOR
# --------------------------------------------------

BASE_DIR = Path(__file__).resolve().parent
OULAD_DIR = BASE_DIR / "oulad"


REQUIRED_FILES = {
    "studentInfo.csv": [
        "id_student",
        "code_module",
        "code_presentation",
        "final_result",
    ],
    "studentVle.csv": [
        "id_student",
        "id_site",
        "date",
        "sum_click",
    ],
    "vle.csv": [
        "id_site",
        "activity_type",
    ],
    "studentAssessment.csv": [
        "id_assessment",
        "id_student",
        "date_submitted",
        "is_banked",
        "score",
    ],
    "assessments.csv": [
        "id_assessment",
        "code_module",
        "code_presentation",
        "assessment_type",
        "date",
        "weight",
    ],
}


def validate_file(filename, required_columns):
    path = OULAD_DIR / filename

    print(f"\nChecking {filename}...")

    if not path.exists():
        print("  ❌ FILE NOT FOUND")
        return None

    try:
        df = pd.read_csv(path)
    except Exception as e:
        print(f"  ❌ Could not read CSV: {e}")
        return None

    print(f"  ✓ File exists")
    print(f"  ✓ Rows: {len(df):,}")
    print(f"  ✓ Columns: {len(df.columns)}")

    missing_columns = [
        column for column in required_columns
        if column not in df.columns
    ]

    if missing_columns:
        print(f"  ❌ Missing columns: {missing_columns}")
    else:
        print("  ✓ Required columns present")

    return df


def main():
    print("=" * 60)
    print("             OULAD DATASET VALIDATION")
    print("=" * 60)

    if not OULAD_DIR.exists():
        print("\n❌ OULAD directory does not exist:")
        print(OULAD_DIR)
        return

    print(f"\nDataset location:")
    print(OULAD_DIR)

    datasets = {}

    # ----------------------------------------------
    # Validate required files
    # ----------------------------------------------

    for filename, required_columns in REQUIRED_FILES.items():
        df = validate_file(filename, required_columns)

        if df is not None:
            datasets[filename] = df

    # ----------------------------------------------
    # Cross-dataset checks
    # ----------------------------------------------

    print("\n" + "=" * 60)
    print("              CROSS-DATASET CHECKS")
    print("=" * 60)

    # Student IDs
    if "studentInfo.csv" in datasets and "studentVle.csv" in datasets:

        info_students = set(
            datasets["studentInfo.csv"]["id_student"].dropna()
        )

        vle_students = set(
            datasets["studentVle.csv"]["id_student"].dropna()
        )

        overlap = info_students & vle_students

        print(
            f"\nStudent ID overlap "
            f"(studentInfo ↔ studentVle): "
            f"{len(overlap):,}"
        )

        if overlap:
            print("  ✓ Student IDs are connected")
        else:
            print("  ❌ No matching student IDs")

    # Assessment IDs
    if (
        "assessments.csv" in datasets
        and "studentAssessment.csv" in datasets
    ):

        assessment_ids = set(
            datasets["assessments.csv"]["id_assessment"].dropna()
        )

        submitted_ids = set(
            datasets["studentAssessment.csv"]["id_assessment"].dropna()
        )

        overlap = assessment_ids & submitted_ids

        print(
            f"\nAssessment ID overlap "
            f"(assessments ↔ studentAssessment): "
            f"{len(overlap):,}"
        )

        if overlap:
            print("  ✓ Assessment IDs are connected")
        else:
            print("  ❌ No matching assessment IDs")

    # ----------------------------------------------
    # Date range
    # ----------------------------------------------

    if "studentVle.csv" in datasets:

        vle_dates = pd.to_numeric(
            datasets["studentVle.csv"]["date"],
            errors="coerce"
        )

        print("\nstudentVle date range:")

        print(f"  Minimum day: {vle_dates.min()}")
        print(f"  Maximum day: {vle_dates.max()}")

    if "studentAssessment.csv" in datasets:

        assessment_dates = pd.to_numeric(
            datasets["studentAssessment.csv"]["date_submitted"],
            errors="coerce"
        )

        print("\nstudentAssessment date range:")

        print(f"  Minimum day: {assessment_dates.min()}")
        print(f"  Maximum day: {assessment_dates.max()}")

    # ----------------------------------------------
    # Final status
    # ----------------------------------------------

    missing_files = [
        filename
        for filename in REQUIRED_FILES
        if not (OULAD_DIR / filename).exists()
    ]

    print("\n" + "=" * 60)

    if not missing_files:
        print("       ✅ OULAD BASIC VALIDATION PASSED")
    else:
        print("       ❌ OULAD VALIDATION FAILED")
        print("\nMissing files:")
        for filename in missing_files:
            print(f"  - {filename}")

    print("=" * 60)


if __name__ == "__main__":
    main()
