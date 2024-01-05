function truncate_float(v)
{
    return Math.round(v*1000) / 1000;
}

function color_lottie_to_hex_component(v)
{
    return Math.round(Math.min(Math.max(v, 0), 1) * 0xff).toString(16).padStart(2, "0");
}

function color_lottie_to_hex(lottie)
{
    return "#" + lottie.slice(0, 3).map(color_lottie_to_hex_component).join("");
}

function color_hex_to_lottie(hex)
{
    return [1, 3, 5].map(i => truncate_float(parseInt(hex.slice(i, i+2), 16) / 255));
}


class BezierEditorHandle
{
    constructor(editor, x, y, editable, parent, global_pos = false)
    {
        this.editor = editor;
        this.x = global_pos ? x : editor._tr(x, editor.scale_x, editor.offset_x);
        this.y = global_pos ? y : editor._tr(y, editor.scale_y, editor.offset_y);
        if ( parent && !global_pos )
        {
            this.x -= parent.x;
            this.y -= parent.y;
        }
        this.editable = editable;
        this.parent = parent;
        editor.handles.push(this);
    }

    canvas_coords()
    {
        return [this.x, this.y];
    }

    absolute_canvas_coords()
    {
        if ( this.parent )
            return [this.x + this.parent.x, this.y + this.parent.y];
        return this.canvas_coords();
    }

    logical_coords(lpx = 0, lpy = 0)
    {
        return {
            x: this.editor._tr_inv(this.x + (this.parent?.x ?? 0), this.editor.scale_x, this.editor.offset_x) - lpx,
            y: this.editor._tr_inv(this.y + (this.parent?.y ?? 0), this.editor.scale_y, this.editor.offset_y) - lpy
        };
    }

    distance(x, y)
    {
        let [tx, ty] = this.absolute_canvas_coords();
        return Math.hypot(tx - x, ty - y);
    }
}

class BezierEditorPoint
{
    constructor(editor, x, y, editable = true, global_pos = false)
    {
        this.pos = new BezierEditorHandle(editor, x, y, editable, null, global_pos);
        this.in_tan = null;
        this.out_tan = null;
    }

    add_in_tan(x, y, editable = true, global_pos = false)
    {
        this.in_tan = new BezierEditorHandle(this.pos.editor, x, y, editable, this.pos, global_pos);
        return this;
    }

    add_out_tan(x, y, editable = true, global_pos = false)
    {
        this.out_tan = new BezierEditorHandle(this.pos.editor, x, y, editable, this.pos, global_pos);
        return this;
    }

    canvas_in_tan()
    {
        if ( this.in_tan )
            return this.in_tan.absolute_canvas_coords();
        else
            return this.pos.canvas_coords();
    }

    canvas_out_tan()
    {
        if ( this.out_tan )
            return this.out_tan.absolute_canvas_coords();
        else
            return this.pos.canvas_coords();
    }
}

class BezierEditor
{
    constructor(on_change, width, height)
    {
        this.canvas = document.createElement("canvas");
        this.canvas.width = width;
        this.canvas.height = height;
        this.canvas.style.width = "100%";
        this.canvas.style.maxWidth = `${width}px`;
        this.context = this.canvas.getContext("2d");
        this.points = [];
        this.handles = [];
        this._closed = false;
        this.drag = null;
        this.on_change = on_change;
        this.continuous_update = true;

        this.canvas.addEventListener("mousedown", this._on_mouse_down.bind(this));
        this.canvas.addEventListener("mousemove", this._on_mouse_move.bind(this));
        this.canvas.addEventListener("mouseup", this._on_mouse_up.bind(this));

        this.canvas_box = this.canvas.getBoundingClientRect();
        this.viewport_scale = 1;
        this.resize_observer = new ResizeObserver(this._on_resize.bind(this)).observe(this.canvas);

        this.radius = 6;
        this.scale_x = 1;
        this.scale_y = 1;
        this.offset_x = 0;
        this.offset_y = 0;
        this.pad = 0;
    }

    get width()
    {
        return this.canvas.width;
    }

    get height()
    {
        return this.canvas.height;
    }

    get open_points()
    {
        if ( this._closed )
            return this.points.slice(0, this.points.length - 1);
        return this.points;
    }

    add_point(...args)
    {
        let point = new BezierEditorPoint(this, ...args);
        this.points.push(point);
        return point;
    }

    close()
    {
        if ( !this._closed && this.points.length )
            this.points.push(this.points[0]);

        this._closed = true;
    }

    get closed()
    {
        return this._closed;
    }

    set closed(closed)
    {
        if ( closed )
            this.close();
        else
            this.open();

        this.on_change();
        this.draw_frame();
    }

    open()
    {
        if ( this._closed && this.points.length > 1 )
            this.points.pop();
        this._closed = false;
    }

    logical_to_canvas(x, y)
    {
        return [
            this._tr(x, this.scale_x, this.offset_x),
            this._tr(y, this.scale_y, this.offset_y)
        ];
    }

    canvas_to_logical(x, y)
    {
        return [
            this._tr_inv(x, this.scale_x, this.offset_x),
            this._tr_inv(y, this.scale_y, this.offset_y)
        ];
    }

    _tr(v, scale, offset)
    {
        if ( scale < 0 )
            return this.pad - scale * (1 - (v - offset));
        else
            return this.pad + scale * (v - offset);
    }

    _tr_inv(v, scale, offset)
    {
        if ( scale < 0 )
            return 1 - (v - this.pad) / -scale + offset;
        else
            return (v - this.pad) / scale + offset;
    }

    interactive_add()
    {
        let x = 0;
        let y = 0;
        if ( this.points[0] )
        {
            x = this.points[0].pos.x;
            y = this.points[0].pos.y;
        }

        let point = new BezierEditorPoint(this, x, y, true, null, true);
        point.add_in_tan(0, 0, true, true);
        point.add_out_tan(0, 0, true, true);

        this.drag = point.pos;
        if ( this.drag )
            this.canvas.style.cursor = "crosshair";

        if ( this._closed )
            this.points.splice(this.points.length - 1, 0, point);
        else
            this.points.push(point);
    }

    draw_background() {}
    draw_foreground() {}

    draw_frame()
    {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);

        if ( !this.points.length )
            return;

        this.draw_background();

        this.context.beginPath();
        this.context.lineWidth = 3 * this.viewport_scale;
        this.context.strokeStyle = "#000";
        this.context.moveTo(this.points[0].pos.x, this.points[0].pos.y);
        for ( let i = 0; i < this.points.length - 1; i += 1 )
        {
            this.context.bezierCurveTo(
                ...this.points[i].canvas_out_tan(),
                ...this.points[i+1].canvas_in_tan(),
                ...this.points[i+1].pos.canvas_coords(),
            );
        }
        this.context.stroke();

        this.context.lineWidth = 2 * this.viewport_scale;
        this.context.beginPath();
        this.context.strokeStyle = "#ccc";
        for ( let h of this.handles )
        {
            if ( h.editable && h.parent )
            {
                this.context.moveTo(...h.parent.canvas_coords());
                this.context.lineTo(...h.absolute_canvas_coords());
            }
        }
        this.context.stroke();


        this.context.fillStyle = "#eee";
        this.context.strokeStyle = "#444";
        for ( let h of this.handles )
        {
            if ( !h.editable )
                continue;

            this.context.beginPath();
            if ( h.parent )
            {
                this.context.arc(...h.absolute_canvas_coords(), this.radius * this.viewport_scale, 0, Math.PI * 2);
            }
            else
            {
                var [x, y] = h.absolute_canvas_coords();
                var r = this.radius * this.viewport_scale;
                this.context.moveTo(x - r, y - r);
                this.context.lineTo(x + r, y - r);
                this.context.lineTo(x + r, y + r);
                this.context.lineTo(x - r, y + r);
                this.context.closePath();
            }

            this.context.fill();
            this.context.stroke();
        }

        this.draw_foreground();
    }

    _get_mouse_handle(ev, only_tan = false)
    {
        let p = this._mouse_event_pos(ev);

        for ( let h of this.handles )
        {
            if ( h.editable && (h.parent || !only_tan) && h.distance(p.x, p.y) < this.radius * this.viewport_scale )
                return h;
        }

        return null;
    }

    _on_mouse_down(ev)
    {
        if ( this.drag )
            return;

        this.drag = this._get_mouse_handle(ev, ev.button == 1);
        if ( this.drag )
            this.canvas.style.cursor = "crosshair";
    }

    _mouse_event_pos(ev)
    {
        let rect = this.canvas.getBoundingClientRect();

        return {
            x: Math.max(this.pad, Math.min(this.width - this.pad, (ev.clientX - rect.left) * this.canvas.width / rect.width)),
            y: Math.max(this.pad, Math.min(this.height - this.pad, (ev.clientY - rect.top) * this.canvas.height / rect.height)),
        };
    }

    _on_mouse_move(ev)
    {
        if ( this.drag )
        {
            let p = this._mouse_event_pos(ev);
            this.drag.x = p.x;
            this.drag.y = p.y;
            if ( this.drag.parent )
            {
                this.drag.x -= this.drag.parent.x;
                this.drag.y -= this.drag.parent.y;
            }
            if ( this.continuous_update )
                this.on_change();
            this.draw_frame();
        }
        else
        {
            if ( this._get_mouse_handle(ev) )
            {
                this.canvas.style.cursor = "pointer";
            }
            else
            {
                this.canvas.style.cursor = "initial";
            }
        }
    }

    _on_mouse_up(ev)
    {
        if ( this.drag )
        {
            this.canvas.style.cursor = "pointer";
            this.drag = null;
            this.on_change();
        }
    }

    _on_resize()
    {
        this.canvas_box = this.canvas.getBoundingClientRect();
        this.viewport_scale = this.canvas.width / this.canvas_box.width;
        this.draw_frame();
    }
}

class BezierPreviewEditor
{
    constructor(parent, initial, on_change, width = 512, height = 512)
    {
        this.on_change = on_change;
        this.bezier_editor = new BezierEditor(this._on_change.bind(this), width, height);
        this.bezier_editor.canvas.classList.add("bezier-editor");
        parent.appendChild(this.bezier_editor.canvas);

        let p = parent.appendChild(document.createElement("p"));

        let btn_add = p.appendChild(document.createElement("button"));
        btn_add.setAttribute("class", "btn btn-primary btn-sm");
        btn_add.addEventListener("click", this.bezier_editor.interactive_add.bind(this.bezier_editor));
        btn_add.appendChild(document.createElement("i")).setAttribute("class", "fa-solid fa-plus");
        btn_add.title = "Add vertex";

        p.appendChild(document.createTextNode(" "));

        let lab = p.appendChild(document.createElement("label"));
        let check_closed = lab.appendChild(document.createElement("input"));
        check_closed.type = "checkbox";
        check_closed.checked = !!initial.c;
        let ed = this.bezier_editor;
        check_closed.addEventListener("input", (ev) => ed.closed = ev.target.checked);
        lab.appendChild(document.createTextNode(" Closed"));

        let v = initial.v ?? [];
        let i = initial.i ?? [];
        let o = initial.o ?? [];
        let count = Math.min(v.length, i.length, o.length);
        if ( count > 0 )
        {
            v = v.slice(0, count);
            o = o.slice(0, count);
            i = i.slice(0, count);

            let minx = Infinity, maxx = -Infinity, miny = Infinity, maxy = -Infinity;
            for ( let [arr, is_tan] of [[v, 0], [o, 1], [i, 1]] )
            {
                for ( let j = 0; j < count; j++ )
                {
                    let x = arr[j][0];
                    let y = arr[j][1];
                    if ( is_tan )
                    {
                        x += v[j][0];
                        y += v[j][1];
                    }

                    if ( x < minx ) minx = x;
                    if ( x > maxx ) maxx = x;
                    if ( y < miny ) miny = y;
                    if ( y > maxy ) maxy = y;
                }
            }

            let pad = 20;
            minx -= pad;
            maxx += pad;
            miny -= pad;
            maxy += pad;
            this.bezier_editor.offset_x = minx;
            this.bezier_editor.offset_y = miny;
            let scale_factor = Math.max(maxx - minx, maxy - miny);
            this.bezier_editor.scale_x = this.bezier_editor.width / scale_factor;
            this.bezier_editor.scale_y = this.bezier_editor.height / scale_factor;

            for ( let j = 0; j < count; j++ )
            {
                this.bezier_editor.add_point(...v[j])
                    .add_in_tan(i[j][0] + v[j][0], i[j][1] + v[j][1])
                    .add_out_tan(o[j][0] + v[j][0], o[j][1] + v[j][1]);
            }
        }

        if ( initial.c )
            this.bezier_editor.close();

        this.bezier_editor.draw_frame();
    }

    to_lottie()
    {
        let out = {
            c: this.bezier_editor.closed,
            v: [],
            i: [],
            o: [],
        };

        for ( let p of this.bezier_editor.open_points )
        {
            let v = p.pos.logical_coords();
            out.v.push([truncate_float(v.x), truncate_float(v.y)]);
            let i = p.in_tan.logical_coords(v.x, v.y);
            out.i.push([truncate_float(i.x), truncate_float(i.y)]);
            let o = p.out_tan.logical_coords(v.x, v.y);
            out.o.push([truncate_float(o.x), truncate_float(o.y)]);
        }

        return out;
    }

    _on_change()
    {
        this.on_change(this.to_lottie());
    }

    static stand_alone(parent, on_change, initial, width, height)
    {
        if ( !initial )
            initial = {
                "c": true,
                "v": [[253,147],[56,153],[253,440],[450,153]],
                "i": [[12,-57],[42,-112],[-32,-114],[46,123]],
                "o": [[-17,-61],[-46,125],[32,-114],[-43,-115]]
            };
        on_change(initial);
        return new BezierPreviewEditor(parent, initial, on_change, width, height);
    }
}

class KeyframePreviewEditor
{
    constructor(parent, initial, on_change, size = 512, extra = {})
    {
        let container = parent.appendChild(document.createElement("div"));

        container.classList.add("keyframe-playground");

        this.bezier_editor = new BezierEditor(this._on_change.bind(this), size, size);
        container.appendChild(this.bezier_editor.canvas);
        this.bezier_editor.pad = this.bezier_editor.radius + 1;
        this.bezier_editor.scale_x = this.bezier_editor.width - this.bezier_editor.pad * 2;
        this.bezier_editor.scale_y = -this.bezier_editor.height + this.bezier_editor.pad * 2;
        this.bezier_editor.add_point(0, 0, false).add_out_tan(
            this._get_component(initial, "o", "x", 0),
            this._get_component(initial, "o", "y", 0),
            true, false
        );
        this.bezier_editor.add_point(1, 1, false).add_in_tan(
            this._get_component(initial, "i", "x", 1),
            this._get_component(initial, "i", "y", 1),
            true, false
        );

        let label = container.appendChild(document.createElement("label"));
        this.checkbox = label.appendChild(document.createElement("input"));
        this.checkbox.type = "checkbox";
        label.appendChild(document.createTextNode(" Hold"));

        if ( extra.foreground )
            this.bezier_editor.draw_foreground = extra.foreground.bind(this.bezier_editor);

        this.bezier_editor.draw_frame();


        let preview_container = container.appendChild(document.createElement("div"));
        preview_container.classList.add("keyframe-preview-container");
        this.preview = preview_container.appendChild(document.createElement("div"));
        this.preview.classList.add("keyframe-preview");

        this.hold = !!initial.h;

        this._update_preview();

        this.checkbox.checked = this.hold;
        this.checkbox.addEventListener("change", ((ev) => {
            this.hold = this.checkbox.checked;
            this._on_change();
        }).bind(this));

        this.on_change = on_change;

        if ( extra.init )
            extra.init(this, container);
    }

    _update_preview()
    {
        this.preview.setAttribute("style", "animation-timing-function:" + this.to_css());
    }

    _on_change()
    {
        this._update_preview();
        this.on_change(this.to_lottie());
    }

    _get_component(initial, tan, comp, defval)
    {
        if ( !initial[tan] || !initial[tan][comp] )
            return defval;

        if ( !Array.isArray(initial[tan][comp] ) )
            return initial[tan][comp];

        if ( initial[tan][comp].length == 0 )
            return defval;

        return initial[tan][comp][0];
    }

    to_css()
    {
        if ( this.hold )
            return "step-end";

        let p1 = this.bezier_editor.points[0].out_tan.logical_coords();
        let p2 = this.bezier_editor.points[1].in_tan.logical_coords();
        return `cubic-bezier(${p1.x},${p1.y},${p2.x},${p2.y})`;
    }

    to_lottie()
    {
        let p1 = this.bezier_editor.points[0].out_tan.logical_coords();
        let p2 = this.bezier_editor.points[1].in_tan.logical_coords();

        return {
            h: this.hold ? 1 : 0,
            o: {
                x: [truncate_float(p1.x)],
                y: [truncate_float(p1.y)],
            },
            i: {
                x: [truncate_float(p2.x)],
                y: [truncate_float(p2.y)],
            }
        };
    }

    static stand_alone(parent, on_change, extra = {})
    {
        let initial = {
            h: 0,
            o: {x: [0.333], y:[0]},
            i: {x: [0.667], y:[1]}
        };
        on_change(initial);
        return new KeyframePreviewEditor(parent, initial, on_change, 512, extra);
    }
}

class GradientPreviewEditor
{
    constructor(parent, lottie, color_count, on_change, dynamic_count = false)
    {
        this.on_change = on_change;
        this.with_alpha = lottie.length >= color_count * 6;
        if ( lottie.length < color_count * 4 )
            color_count = Math.floor(lottie.length / 4);

        let self = this;
        this.colors = [];

        let label = parent.appendChild(document.createElement("p"))
            .appendChild(document.createElement("label"));
        let check_apha = label.appendChild(document.createElement("input"));
        check_apha.type = "checkbox";
        check_apha.checked = this.with_alpha;
        check_apha.addEventListener("input", () => {
            self.with_alpha = check_apha.checked;
            for ( let color of self.colors )
            {
                color.alpha_input.style.display = self.with_alpha ? "inline-block" : "none";
            }
            self._on_change();
        });
        label.appendChild(document.createTextNode(" Enable Alpha"));


        this.parent = parent.appendChild(document.createElement("div"));
        for ( let i = 0; i < color_count; i++ )
        {
            this.add_color(
                lottie[i * 4],
                color_lottie_to_hex(lottie.slice(i * 4 + 1, i * 4 + 4)),
                this.with_alpha ? lottie[4 * color_count + i * 2 + 1] : 1,
                dynamic_count
            );
        }

        let preview_cont = parent.appendChild(document.createElement("div"));
        preview_cont.classList.add("alpha_checkered");

        this.preview = preview_cont.appendChild(document.createElement("div"));
        this.preview.classList.add("gradient-preview");
        this.preview.setAttribute("style", "background:" + this.to_css());

        if ( dynamic_count )
        {
            let btn = parent.appendChild(document.createElement("button"));
            btn.setAttribute("class", "btn btn-primary btn-sm");
            btn.title = "Add stop";
            btn.appendChild(document.createElement("i")).setAttribute("class", "fa-solid fa-plus");
            btn.addEventListener("click", () => {
                self.add_color(1, "#000000", 1, true);
                self._on_change();
            });
        }
    }

    add_color(offset, hex, alpha, dynamic_count)
    {
        let self = this;
        let color = {
            offset: offset,
            color: hex,
            alpha: alpha,
        };
        this.colors.push(color);

        let p = this.parent.appendChild(document.createElement("p"));
        p.classList.add("gradient-editor");
        let in_off = p.appendChild(document.createElement("input"));
        in_off.title = "Offset";
        in_off.type = "number";
        in_off.min = 0;
        in_off.max = 1;
        in_off.step = 0.01;
        in_off.value = color.offset;
        in_off.addEventListener("input", () => {
            color.offset = Number(in_off.value);
            self._on_change();
        });

        let in_col = p.appendChild(document.createElement("input"));
        in_col.type = "color";
        in_col.value = color.color;
        in_col.addEventListener("input", () => {
            color.color = in_col.value;
            self._on_change();
        });

        let in_alpha = p.appendChild(document.createElement("input"));
        in_alpha.title = "Alpha";
        in_alpha.type = "number";
        in_alpha.min = 0;
        in_alpha.max = 1;
        in_alpha.step = 0.01;
        in_alpha.value = color.alpha;
        in_alpha.style.display = this.with_alpha ? "inline-block" : "none";
        in_alpha.addEventListener("input", () => {
            color.alpha = Number(in_alpha.value);
            self._on_change();
        });
        color.alpha_input = in_alpha;

        if ( dynamic_count )
        {
            let btn = p.appendChild(document.createElement("button"));
            btn.setAttribute("class", "btn btn-danger btn-sm");
            btn.title = "Remove stop";
            btn.appendChild(document.createElement("i")).setAttribute("class", "fa-solid fa-minus");
            btn.addEventListener("click", () => {
                self.parent.removeChild(p);
                self.colors.splice(self.colors.indexOf(color), 1);
                self._on_change();
            });
        }
    }

    to_css()
    {
        let items = [];
        for ( let color of this.colors )
        {
            let stop = color.color;
            if ( this.with_alpha )
                stop += color_lottie_to_hex_component(color.alpha);
            stop += " " + (color.offset * 100) + "%";
            items.push(stop);
        }
        return "linear-gradient(90deg, " + items.join(",") + ");"
    }

    _on_change()
    {
        let lottie = [];
        let alpha = [];
        for ( let color of this.colors )
        {
            lottie.push(color.offset, ...color_hex_to_lottie(color.color));
            if ( this.with_alpha )
                alpha.push(color.offset, color.alpha);
        }

        this.preview.setAttribute("style", "background:" + this.to_css());
        this.on_change(lottie.concat(alpha));
    }


    static stand_alone(parent, on_change)
    {
        let initial = [0, 0.161, 0.184, 0.459, 0.5, 0.196, 0.314, 0.69, 1, 0.769, 0.851, 0.961];
        on_change(initial);
        return new GradientPreviewEditor(parent, initial, 3, on_change, true);
    }
}
