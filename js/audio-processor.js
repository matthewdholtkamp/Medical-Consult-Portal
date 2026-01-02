class PCMProcessor extends AudioWorkletProcessor {
  constructor() {
    super();
    this.bufferSize = 4096;
    this.buffer = new Float32Array(this.bufferSize);
    this.byteCount = 0;
  }

  process(inputs, outputs, parameters) {
    const input = inputs[0];
    const output = outputs[0];

    // Input is usually [channel0, channel1, ...]. We only care about channel 0 (mono).
    if (input.length > 0) {
      const channelData = input[0];

      // Fill buffer
      for (let i = 0; i < channelData.length; i++) {
        this.buffer[this.byteCount] = channelData[i];
        this.byteCount++;

        // When buffer is full, flush to main thread
        if (this.byteCount >= this.bufferSize) {
            // We must copy the buffer because the underlying ArrayBuffer is detached upon transfer
            const chunk = this.buffer.slice(0, this.bufferSize);
            this.port.postMessage(chunk);
            this.byteCount = 0;
        }
      }
    }

    // Pass audio through if needed (e.g. for local monitoring), or silence it.
    // Dr. H code connects processor to destination, but we generally don't want to hear our own voice echo.
    // However, keeping the chain alive is good practice.
    return true;
  }
}

registerProcessor('pcm-processor', PCMProcessor);
