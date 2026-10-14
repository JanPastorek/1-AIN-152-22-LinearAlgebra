"""
Shared palette, pacing and helpers for the chapter animation scripts
(chapter2_definitions.py ... chapter7_definitions.py).

Chapter scripts start with:
    import os, sys; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
    from la_style import *
"""
from manim import *
import numpy as np

# ---------- palette (matches the web page's dark theme) ----------
BG, INK, MUTE = "#0f151c", "#e4eaf0", "#97a4b1"
C1, C2, C3, AMB, WARN = "#62a4ff", "#ff7eab", "#3fcf98", "#f0b429", "#ff9466"
config.background_color = BG
Tex.set_default(color=INK)
MathTex.set_default(color=INK)


# ---------- pacing: slow enough for students to follow ----------
# Every animation runs SLOW times longer (never shorter than MIN_RT seconds),
# each substantial step is followed by a HOLD pause, and explicit waits are
# stretched by WAIT_SLOW. Set all three to 1 for the original fast cut.
SLOW, MIN_RT, HOLD, WAIT_SLOW = 2.0, 0.6, 0.8, 1.5

# Manim may import this file more than once; keep the true originals only once.
if not hasattr(Scene, "_unpaced_play"):
    Scene._unpaced_play, Scene._unpaced_wait = Scene.play, Scene.wait


def _paced_play(self, *args, **kwargs):
    if args and all(isinstance(a, Wait) for a in args):
        # Scene.wait() is implemented as play(Wait(...)); it is already stretched.
        return Scene._unpaced_play(self, *args, **kwargs)
    rt = kwargs.get("run_time")
    if rt is None:
        rts = [a.run_time for a in args if isinstance(a, Animation)]
        rt = max(rts) if rts else 1.0
    kwargs["run_time"] = max(MIN_RT, rt * SLOW)
    Scene._unpaced_play(self, *args, **kwargs)
    if kwargs["run_time"] >= 1.0:
        Scene._unpaced_wait(self, HOLD)


def _paced_wait(self, duration=1.0, *args, **kwargs):
    Scene._unpaced_wait(self, duration * WAIT_SLOW, *args, **kwargs)


Scene.play, Scene.wait = _paced_play, _paced_wait


# ---------- helpers ----------
def title(text):
    return Tex(text, font_size=38, color=INK).to_edge(UP, buff=0.35)


def caption(text):
    return Tex(text, font_size=30, color=MUTE).to_edge(DOWN, buff=0.35)


def mat(rows, h=1.0, v=0.75, scale=0.8):
    m = Matrix([[str(x) for x in r] for r in rows], h_buff=h, v_buff=v,
               element_alignment_corner=ORIGIN)
    m.get_brackets().set_color(INK)
    return m.scale(scale)


def aug_line(m, split):
    cols = m.get_columns()
    x = (cols[split - 1].get_right()[0] + cols[split].get_left()[0]) / 2
    br = m.get_brackets()
    top, bot = br.get_top()[1] - 0.1, br.get_bottom()[1] + 0.1
    return DashedLine([x, top, 0], [x, bot, 0], color=MUTE, dash_length=0.08, stroke_width=2)


def row_box(m, i, color=C3):
    return SurroundingRectangle(m.get_rows()[i], color=color, buff=0.1, corner_radius=0.06)


def swap_caption(old, new, scene):
    scene.play(ReplacementTransform(old, new), run_time=0.6)
    return new


def plane(xr=(-5, 5), yr=(-3.5, 3.5), **kw):
    p = NumberPlane(x_range=[xr[0], xr[1], 1], y_range=[yr[0], yr[1], 1],
                    background_line_style={"stroke_color": "#26323e", "stroke_width": 1},
                    axis_config={"stroke_color": MUTE}, **kw)
    return p


def boxed(mob, color=BG, opacity=0.9, buff=0.12):
    return VGroup(BackgroundRectangle(mob, fill_color=color, fill_opacity=opacity, buff=buff), mob)
