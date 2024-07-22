document.addEventListener('DOMContentLoaded', () => {
    const canvasElement = document.getElementById('canvas');
    const canvas = new fabric.Canvas('canvas', { selection: false });
    let imgInstance = null;
    let state = [];
    let mods = 0;
    let textInstance = null;

    function saveState() {
        state.push(canvas.toJSON());
        mods += 1;
    }

    function applyFilter(filter, value) {
        if (imgInstance) {
            Caman(canvasElement, function () {
                this.revert(false);
                if (filter) {
                    this[filter](value).render();
                } else {
                    this.render();
                }
                saveState();
            });
        }
    }

    document.getElementById('upload').addEventListener('change', (e) => {
        const file = e.target.files[0];
        const reader = new FileReader();

        reader.onload = (f) => {
            const data = f.target.result;
            fabric.Image.fromURL(data, (img) => {
                if (imgInstance) {
                    canvas.remove(imgInstance);
                }
                imgInstance = img;
                const ratio = Math.min(canvas.width / img.width, canvas.height / img.height);
                img.scale(ratio);
                img.set({ left: 0, top: 0, selectable: false, evented: false });
                canvas.add(img);
                canvas.sendToBack(img);
                canvas.renderAll();
                saveState();
            });
        };

        reader.readAsDataURL(file);
    });

    document.getElementById('brightness').addEventListener('input', (e) => {
        applyFilter('brightness', parseInt(e.target.value));
    });

    document.getElementById('contrast').addEventListener('input', (e) => {
        applyFilter('contrast', parseInt(e.target.value));
    });

    document.getElementById('saturation').addEventListener('input', (e) => {
        applyFilter('saturation', parseInt(e.target.value));
    });

    document.getElementById('exposure').addEventListener('input', (e) => {
        applyFilter('exposure', parseInt(e.target.value));
    });

    document.getElementById('add-text').addEventListener('click', () => {
        const customText = document.getElementById('custom-text').value;
        if (!customText.trim()) {
            alert('Please enter some text.');
            return;
        }

        const text = new fabric.Text(customText, {
            left: 100,
            top: 100,
            fill: document.getElementById('text-color').value,
            fontSize: parseInt(document.getElementById('text-size').value),
            fontFamily: document.getElementById('font-family').value,
            selectable: true
        });

        if (textInstance) {
            canvas.remove(textInstance);
        }
        textInstance = text;
        canvas.add(text);
        canvas.setActiveObject(text);
        canvas.renderAll();
        saveState();
    });

    document.getElementById('text-size').addEventListener('input', (e) => {
        if (textInstance) {
            textInstance.set({ fontSize: parseInt(e.target.value) });
            canvas.renderAll();
            saveState();
        }
    });

    document.getElementById('text-color').addEventListener('input', (e) => {
        if (textInstance) {
            textInstance.set({ fill: e.target.value });
            canvas.renderAll();
            saveState();
        }
    });

    document.getElementById('font-family').addEventListener('change', (e) => {
        if (textInstance) {
            textInstance.set({ fontFamily: e.target.value });
            canvas.renderAll();
            saveState();
        }
    });

    document.getElementById('bold').addEventListener('click', () => {
        if (textInstance) {
            textInstance.set({ fontWeight: textInstance.fontWeight === 'bold' ? 'normal' : 'bold' });
            canvas.renderAll();
            saveState();
        }
    });

    document.getElementById('italic').addEventListener('click', () => {
        if (textInstance) {
            textInstance.set({ fontStyle: textInstance.fontStyle === 'italic' ? 'normal' : 'italic' });
            canvas.renderAll();
            saveState();
        }
    });

    document.getElementById('undo').addEventListener('click', () => {
        if (mods > 0) {
            canvas.clear();
            canvas.loadFromJSON(state.pop(), () => {
                canvas.renderAll();
                mods -= 1;
            });
        }
    });

    document.getElementById('save').addEventListener('click', () => {
        const dataURL = canvasElement.toDataURL({ format: 'png', quality: 1 });
        const link = document.createElement('a');
        link.href = dataURL;
        link.download = 'edited-image.png';
        link.click();
    });
});
