"""
Script untuk evaluasi model YOLO
Menampilkan akurasi (mAP), confusion matrix, dan label kelas
"""

import os
from ultralytics import YOLO

def evaluate_model():
    # Path ke model terbaik
    model_path = os.path.join("runs", "train", "exp", "weights", "best.pt")

    # Cek apakah model ada
    if not os.path.exists(model_path):
        print(f"Model tidak ditemukan di: {model_path}")
        return

    # Load model
    print("Loading model...")
    model = YOLO(model_path)

    # Tampilkan informasi model
    print("\n=== INFORMASI MODEL ===")
    print(f"Model path: {model_path}")
    print(f"Jumlah kelas: {len(model.names)}")
    print("Label kelas:")
    for idx, name in model.names.items():
        print(f"  {idx}: {name}")

    # Jalankan validasi
    print("\n=== MENJALANKAN VALIDASI ===")
    print("Mengevaluasi model pada dataset validasi...")

    # Jalankan validasi dengan confusion matrix
    results = model.val(
        data='data.yaml',
        split='val',
        conf=0.25,  # confidence threshold
        iou=0.45,   # IoU threshold
        imgsz=640,  # image size
        save_json=True,  # simpan hasil dalam format JSON
        save_conf=True,  # simpan confidence
        plots=True,      # generate plots termasuk confusion matrix
        verbose=True     # tampilkan detail
    )

    # Tampilkan hasil evaluasi
    print("\n=== HASIL EVALUASI ===")
    print(".4f")
    print(".4f")
    print(".4f")
    print(f"Recall: {results.results_dict.get('metrics/recall(B)', 0):.4f}")

    # Tampilkan per-class metrics jika ada
    if hasattr(results, 'ap_class_index') and results.ap_class_index is not None:
        print("\n=== METRIK PER KELAS ===")
        for i, ap in enumerate(results.ap_class_index):
            class_name = model.names.get(i, f"Class {i}")
            print(".4f")

    print("\n=== FILE YANG DIHASILKAN ===")
    print("- Confusion matrix tersimpan sebagai: runs/train/exp/confusion_matrix.png")
    print("- Confusion matrix normalized: runs/train/exp/confusion_matrix_normalized.png")
    print("- Kurva Precision-Recall: runs/train/exp/BoxPR_curve.png")
    print("- Kurva F1: runs/train/exp/BoxF1_curve.png")
    print("- Kurva Precision: runs/train/exp/BoxP_curve.png")
    print("- Kurva Recall: runs/train/exp/BoxR_curve.png")
    print("- Hasil validasi batch: runs/train/exp/val_batch*.jpg")

    print("\nEvaluasi selesai!")

if __name__ == "__main__":
    evaluate_model()