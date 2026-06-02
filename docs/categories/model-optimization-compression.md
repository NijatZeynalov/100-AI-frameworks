# Model Optimization & Compression

## Goal

Test practical techniques for making models smaller, faster, and cheaper to deploy.

## Problem Space

Quantization, binarization, reduced-precision training, model compression, and efficient edge or accelerator deployment.

## Frameworks

| # | Framework | Status | Planned project | Docs Page |
|---|---|---|---|---|
| 044 | Larq | Pending | Train a compact binarized image classifier and compare model size, latency, and accuracy against a standard TensorFlow/Keras baseline. | [Experiment](../experiments/044-larq.md) |
| 045 | AIMET | Pending | Quantize a PyTorch or ONNX vision model with AIMET and compare accuracy, latency, and exported model behavior. | [Experiment](../experiments/045-aimet.md) |
| 046 | HQQ | Pending | Quantize a small open-source language model with HQQ and compare memory usage, throughput, and output quality against the original model. | [Experiment](../experiments/046-hqq.md) |
| 047 | Brevitas | Pending | Train a quantization-aware classifier with Brevitas and export it for an accelerated inference target. | [Experiment](../experiments/047-brevitas.md) |
