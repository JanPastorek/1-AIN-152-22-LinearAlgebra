"""
Manim scenes for the definitions of Chapter 1 of
S. J. Leon, Linear Algebra with Applications (8th ed.),
plus one scene for the closing neural-network application.

Render one scene:   manim -qm chapter1_definitions.py RowOperations
Render all scenes:  manim -qm -a chapter1_definitions.py
Requires Manim Community v0.18+ and a LaTeX installation.
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


# =================================================================
# 1.1  Linear systems: solution sets of a 2 x 2 system
# =================================================================
class ConsistentSystems(Scene):
    def construct(self):
        self.add(title(r"A solution lies on \emph{every} line of the system"))
        ax = Axes(x_range=[-4, 4, 1], y_range=[-3, 3, 1], x_length=6.6, y_length=5,
                  axis_config={"color": MUTE, "stroke_width": 2}).shift(LEFT * 2.6 + DOWN * 0.3)
        self.play(Create(ax), run_time=0.8)

        def seg(a, b, c, color, **kw):
            # clip a x + b y = c to the axes box
            pts = []
            for x in (-4, 4):
                if abs(b) > 1e-9:
                    y = (c - a * x) / b
                    if -3 <= y <= 3:
                        pts.append((x, y))
            for y in (-3, 3):
                if abs(a) > 1e-9:
                    x = (c - b * y) / a
                    if -4 <= x <= 4:
                        pts.append((x, y))
            pts = sorted(set(pts))
            p, q = pts[0], pts[-1]
            return Line(ax.c2p(*p), ax.c2p(*q), color=color, stroke_width=5, **kw)

        l1 = seg(1, 1, 2, C1)
        eq1 = MathTex(r"x_1 + x_2 = 2", color=C1).move_to(RIGHT * 3.7 + UP * 1.6)
        self.play(Create(l1), Write(eq1))

        states = [
            ((1, -1, 2), r"x_1 - x_2 = 2", r"one solution: $(2,0)$", C3),
            ((1, 1, 1), r"x_1 + x_2 = 1", r"parallel: \emph{inconsistent}", WARN),
            ((1, 1, 2), r"x_1 + x_2 = 2", r"same line: infinitely many", C1),
        ]
        l2 = eq2 = verdict = dot = None
        for (a, b, c), etex, vtex, vcol in states:
            new_l2 = seg(a, b, c, C2)
            if (a, b, c) == (1, 1, 2):
                new_l2 = DashedLine(new_l2.get_start(), new_l2.get_end(), color=C2, stroke_width=5, dash_length=0.2)
            new_eq2 = MathTex(etex, color=C2).next_to(eq1, DOWN, buff=0.35)
            new_v = Tex(vtex, font_size=34, color=vcol).next_to(new_eq2, DOWN, buff=0.7)
            anims = []
            if l2 is None:
                anims += [Create(new_l2), Write(new_eq2), FadeIn(new_v)]
            else:
                anims += [Transform(l2, new_l2), TransformMatchingTex(eq2, new_eq2), FadeTransform(verdict, new_v)]
            if dot is not None:
                anims.append(FadeOut(dot))
                dot = None
            self.play(*anims, run_time=1.2)
            if l2 is None:
                l2 = new_l2
            eq2, verdict = new_eq2, new_v
            if (a, b, c) == (1, -1, 2):
                dot = Dot(ax.c2p(2, 0), color=INK, radius=0.09)
                self.play(GrowFromCenter(dot), Flash(dot, color=C3))
            self.wait(1.2)
        self.play(FadeIn(caption(r"Every linear system has 0, 1 or infinitely many solutions.")))
        self.wait(1.5)


# =================================================================
# 1.1  Equivalent systems: the three elementary row operations
# =================================================================
class RowOperations(Scene):
    def construct(self):
        ttl = title(r"Row operations give an \emph{equivalent} system")
        self.add(ttl)
        rows = [[1, 2, 1, 3], [3, -1, -3, -1], [2, 3, 1, 4]]
        m = mat(rows, h=1.15).shift(DOWN * 0.2)
        line = aug_line(m, 3)
        labels = VGroup(*[MathTex(f"R_{i+1}", font_size=30, color=MUTE).next_to(m.get_rows()[i], LEFT, buff=0.75) for i in range(3)])
        self.play(Write(m), Create(line), FadeIn(labels))
        op = Tex("", font_size=34)
        self.add(op)

        steps = [
            ("III", r"$R_2 \leftarrow R_2 - 3R_1$", [[1, 2, 1, 3], [0, -7, -6, -10], [2, 3, 1, 4]], [1], 0),
            ("III", r"$R_3 \leftarrow R_3 - 2R_1$", [[1, 2, 1, 3], [0, -7, -6, -10], [0, -1, -1, -2]], [2], 0),
            ("I", r"$R_2 \leftrightarrow R_3$", [[1, 2, 1, 3], [0, -1, -1, -2], [0, -7, -6, -10]], [1, 2], None),
            ("II", r"$R_2 \leftarrow (-1)\,R_2$", [[1, 2, 1, 3], [0, 1, 1, 2], [0, -7, -6, -10]], [1], None),
            ("III", r"$R_3 \leftarrow R_3 + 7R_2$", [[1, 2, 1, 3], [0, 1, 1, 2], [0, 0, 1, 4]], [2], 1),
        ]
        colors = {"I": AMB, "II": C2, "III": C1}
        for kind, text, new_rows, changed, pivot in steps:
            new_op = Tex(f"Type {kind}: " + text, font_size=36, color=colors[kind]).next_to(m, DOWN, buff=0.7)
            self.play(FadeTransform(op, new_op), run_time=0.5)
            op = new_op
            boxes = VGroup(*[row_box(m, i, colors[kind]) for i in changed])
            piv = row_box(m, pivot, MUTE) if pivot is not None else VGroup()
            self.play(Create(boxes), Create(piv), run_time=0.5)
            if kind == "I":
                r1, r2 = m.get_rows()[changed[0]], m.get_rows()[changed[1]]
                d = r2.get_center()[1] - r1.get_center()[1]
                self.play(r1.animate.shift(UP * d), r2.animate.shift(DOWN * d), path_arc=0, run_time=0.9)
                new = mat(new_rows, h=1.15).move_to(m)
                self.remove(m, r1, r2)
                self.add(new)
                m = new
            else:
                new = mat(new_rows, h=1.15).move_to(m)
                self.play(ReplacementTransform(m, new), run_time=0.9)
                m = new
            self.play(FadeOut(boxes), FadeOut(piv), run_time=0.3)
            keep = {ttl, line, labels, op, m}
            self.remove(*[x for x in self.mobjects if x not in keep])
            self.add(m)
            self.wait(0.4)
        sol = Tex(r"Strict triangular form. Back substitution: $(x_1,x_2,x_3)=(3,-2,4)$,", font_size=32, color=C3)
        sol2 = Tex(r"the same solution as the original system.", font_size=32, color=C3)
        g = VGroup(sol, sol2).arrange(DOWN, buff=0.15).next_to(m, DOWN, buff=0.6)
        self.play(FadeOut(op), Write(g))
        self.wait(2)


# =================================================================
# 1.1  Strict triangular form and back substitution
# =================================================================
class BackSubstitution(Scene):
    def construct(self):
        self.add(title(r"Strict triangular form $\Rightarrow$ back substitution"))
        eqs = MathTex(
            r"3x_1 + 2x_2 + x_3 &= 1\\",
            r"x_2 - x_3 &= 2\\",
            r"2x_3 &= 4",
        ).scale(1.05).shift(LEFT * 2.7 + DOWN * 0.1)
        coef = mat([[3, 2, 1], [0, 1, -1], [0, 0, 2]]).shift(RIGHT * 3.4 + UP * 0.9)
        zeros = VGroup(coef.get_entries()[3], coef.get_entries()[6], coef.get_entries()[7])
        diag = VGroup(coef.get_entries()[0], coef.get_entries()[4], coef.get_entries()[8])
        self.play(Write(eqs), FadeIn(coef))
        self.play(*[Indicate(z, color=C2) for z in zeros], run_time=1)
        self.play(*[Circumscribe(d, color=C3, shape=Circle) for d in diag], run_time=1.2)
        lab = Tex(r"zeros below, nonzero diagonal", font_size=30, color=MUTE).next_to(coef, DOWN, buff=0.3)
        self.play(FadeIn(lab))

        res = VGroup()
        steps = [
            (2, r"x_3 = 4/2 = 2"),
            (1, r"x_2 = 2 + x_3 = 4"),
            (0, r"x_1 = \tfrac{1}{3}(1 - 2\cdot 4 - 2) = -3"),
        ]
        anchor = RIGHT * 3.4 + DOWN * 1.4
        for k, (i, tex) in enumerate(steps):
            box = SurroundingRectangle(eqs[i], color=C3, buff=0.12)
            r = MathTex(tex, color=C3, font_size=40).move_to(anchor + DOWN * 0.6 * k)
            self.play(Create(box), run_time=0.4)
            self.play(TransformFromCopy(eqs[i], r), run_time=1.0)
            self.play(FadeOut(box), run_time=0.3)
            res.add(r)
        self.play(Indicate(res, color=AMB, scale_factor=1.05))
        self.play(FadeIn(caption(r"Solve the last equation first, then substitute upward.")))
        self.wait(1.5)


# =================================================================
# 1.2  Row echelon form: the three conditions
# =================================================================
class RowEchelon(Scene):
    def construct(self):
        self.add(title(r"Row echelon form"))
        rows = [[1, 4, 2, 3, 0], [0, 0, 1, 5, 2], [0, 0, 0, 1, 7], [0, 0, 0, 0, 0]]
        m = mat(rows, h=1.0).shift(LEFT * 2.6 + DOWN * 0.2)
        self.play(Write(m))
        E = m.get_entries()
        n = 5
        leads = [E[0], E[1 * n + 2], E[2 * n + 3]]
        # staircase
        pts = []
        for r, c in [(0, 0), (1, 2), (2, 3)]:
            e = E[r * n + c]
            pts += [e.get_corner(UL) + LEFT * 0.12 + UP * 0.08, e.get_corner(DL) + LEFT * 0.12 + DOWN * 0.12]
        stair = VMobject(color=AMB, stroke_width=4)
        corners = [pts[0], pts[1]]
        for k in range(1, 3):
            corners += [[pts[2 * k][0], pts[2 * k - 1][1], 0], pts[2 * k], pts[2 * k + 1]]
        stair.set_points_as_corners([np.array(p) for p in corners])

        conds = VGroup(
            Tex(r"(i) the first nonzero entry of each nonzero row is 1", font_size=30),
            Tex(r"(ii) each row starts further right than the one above", font_size=30),
            Tex(r"(iii) zero rows are at the bottom", font_size=30),
        ).arrange(DOWN, aligned_edge=LEFT, buff=0.45).to_edge(RIGHT, buff=0.5).shift(DOWN * 0.2)

        self.play(Write(conds[0]))
        self.play(*[Circumscribe(e, color=C3, shape=Circle, fade_out=False) for e in leads], conds[0].animate.set_color(C3))
        self.play(Write(conds[1]))
        self.play(Create(stair), conds[1].animate.set_color(AMB), run_time=1.5)
        self.play(Write(conds[2]))
        zr = row_box(m, 3, C2)
        self.play(Create(zr), conds[2].animate.set_color(C2))
        self.wait(0.6)
        cap = caption(r"Gaussian elimination: row operations I, II, III until the matrix looks like this.")
        self.play(FadeIn(cap))
        self.wait(2)


# =================================================================
# 1.2  Reduced row echelon form; lead and free variables
# =================================================================
class ReducedEchelon(Scene):
    def construct(self):
        self.add(title(r"Reduced row echelon form: clear \emph{above} the pivots too"))
        rows = [[1, -1, 0, 0, 160], [0, 1, -1, 0, -40], [0, 0, 1, -1, 210], [0, 0, 0, 0, 0]]
        m = mat(rows, h=1.25).shift(UP * 0.5)
        line = aug_line(m, 4)
        hdr = VGroup(*[MathTex(f"x_{j+1}", font_size=32, color=MUTE).next_to(m.get_columns()[j], UP, buff=0.35) for j in range(4)])
        self.play(Write(m), Create(line), FadeIn(hdr))
        op = Tex("", font_size=34)
        steps = [
            (r"$R_2 \leftarrow R_2 + R_3$", [[1, -1, 0, 0, 160], [0, 1, 0, -1, 170], [0, 0, 1, -1, 210], [0, 0, 0, 0, 0]], 1),
            (r"$R_1 \leftarrow R_1 + R_2$", [[1, 0, 0, -1, 330], [0, 1, 0, -1, 170], [0, 0, 1, -1, 210], [0, 0, 0, 0, 0]], 0),
        ]
        for text, new_rows, i in steps:
            new_op = Tex("Gauss--Jordan: " + text, font_size=34, color=C1).next_to(m, DOWN, buff=0.5)
            self.play(FadeTransform(op, new_op), Create(b := row_box(m, i, C1)), run_time=0.6)
            op = new_op
            new = mat(new_rows, h=1.25).move_to(m)
            self.play(ReplacementTransform(m, new), FadeOut(b), run_time=1)
            m = new
        self.play(FadeOut(op))
        E = m.get_entries()
        pivots = VGroup(E[0], E[6], E[12])
        self.play(*[Circumscribe(p, color=C3, shape=Circle, fade_out=False) for p in pivots])
        self.play(hdr[0].animate.set_color(C3), hdr[1].animate.set_color(C3), hdr[2].animate.set_color(C3), hdr[3].animate.set_color(AMB))
        lf = Tex(r"lead: $x_1,x_2,x_3$ \quad free: $x_4 = \alpha$ (any value)", font_size=34).next_to(m, DOWN, buff=0.5)
        self.play(Write(lf))
        sol = MathTex(r"(x_1,x_2,x_3,x_4) = (330+\alpha,\ 170+\alpha,\ 210+\alpha,\ \alpha)", font_size=36, color=C3).next_to(lf, DOWN, buff=0.35)
        self.play(Write(sol))
        self.wait(2)


# =================================================================
# 1.2  Homogeneous systems (Theorem 1.2.1)
# =================================================================
class Homogeneous(ThreeDScene):
    def construct(self):
        self.set_camera_orientation(phi=68 * DEGREES, theta=-50 * DEGREES, zoom=0.85)
        axes = ThreeDAxes(x_range=[-3, 3], y_range=[-3, 3], z_range=[-3, 3], x_length=6, y_length=6, z_length=5,
                          axis_config={"color": MUTE, "stroke_width": 2})
        t = title(r"Homogeneous: 2 equations, 3 unknowns $\Rightarrow$ nontrivial solutions")
        cap = caption(r"Two planes through the origin meet in a line: $x_1 = 0,\ x_2 = -\alpha,\ x_3 = \alpha$.")
        self.add_fixed_in_frame_mobjects(t)
        self.add(axes)

        def plane(normal, color):
            n = np.array(normal, dtype=float)
            u = np.cross(n, [0.3, 0.5, 0.8]); u /= np.linalg.norm(u)
            w = np.cross(n, u); w /= np.linalg.norm(w)
            return Surface(lambda s, r: axes.c2p(*(2.6 * s * u + 2.6 * r * w)), u_range=[-1, 1], v_range=[-1, 1],
                           resolution=(8, 8), fill_color=color, fill_opacity=0.35, checkerboard_colors=False,
                           stroke_color=color, stroke_width=0.5)

        p1, p2 = plane([1, 1, 1], C1), plane([1, -1, -1], C2)
        e1 = MathTex(r"x_1 + x_2 + x_3 = 0", color=C1, font_size=36).to_corner(UL).shift(DOWN * 0.8)
        e2 = MathTex(r"x_1 - x_2 - x_3 = 0", color=C2, font_size=36).next_to(e1, DOWN, aligned_edge=LEFT)
        self.add_fixed_in_frame_mobjects(e1, e2)
        self.remove(e1, e2)
        self.play(Create(p1), Write(e1), run_time=1.2)
        self.play(Create(p2), Write(e2), run_time=1.2)
        line = Line3D(axes.c2p(0, -2.6, 2.6), axes.c2p(0, 2.6, -2.6), color=C3, thickness=0.04)
        self.play(Create(line))
        dot = Dot3D(axes.c2p(0, 0, 0), color=INK, radius=0.08)
        self.add(dot)
        self.add_fixed_in_frame_mobjects(cap)
        self.remove(cap)
        self.play(FadeIn(cap))
        self.begin_ambient_camera_rotation(rate=0.25)
        self.wait(5)
        self.stop_ambient_camera_rotation()


# =================================================================
# 1.3  Scalar multiplication and matrix addition
# =================================================================
class MatrixAddScale(Scene):
    def construct(self):
        self.add(title(r"Addition and scalar multiplication: entry by entry"))
        A = mat([[3, 2, 1], [4, 5, 6]])
        B = mat([[2, 2, 2], [1, 2, 3]])
        S = mat([[5, 4, 3], [5, 7, 9]])
        plus, eq = MathTex("+"), MathTex("=")
        row = VGroup(A, plus, B, eq, S).arrange(RIGHT, buff=0.35).shift(UP * 1.2)
        for e in S.get_entries():
            e.set_opacity(0)
        self.play(FadeIn(A), FadeIn(plus), FadeIn(B), FadeIn(eq), FadeIn(S.get_brackets()))
        for k in range(6):
            a, b, s = A.get_entries()[k], B.get_entries()[k], S.get_entries()[k]
            self.play(a.animate.set_color(C1), b.animate.set_color(C2), run_time=0.15)
            s.set_opacity(1).set_color(C3)
            self.play(TransformFromCopy(VGroup(a, b), s), run_time=0.35)
            self.play(a.animate.set_color(INK), b.animate.set_color(INK), run_time=0.1)
        f = MathTex(r"(A+B)_{ij} = a_{ij} + b_{ij}", font_size=36, color=MUTE).next_to(row, DOWN, buff=0.35)
        self.play(Write(f))

        alpha = MathTex(r"\tfrac12", color=AMB)
        C = mat([[4, 8, 2], [6, 8, 10]])
        R = mat([[2, 4, 1], [3, 4, 5]])
        row2 = VGroup(alpha, C, MathTex("="), R).arrange(RIGHT, buff=0.35).shift(DOWN * 1.7)
        for e in R.get_entries():
            e.set_opacity(0)
        self.play(FadeIn(row2))
        self.play(*[TransformFromCopy(VGroup(alpha.copy(), C.get_entries()[k]), R.get_entries()[k].set_opacity(1).set_color(AMB)) for k in range(6)],
                  lag_ratio=0.1, run_time=1.6)
        g = MathTex(r"(\alpha A)_{ij} = \alpha\, a_{ij}", font_size=36, color=MUTE).next_to(row2, DOWN, buff=0.35)
        self.play(Write(g))
        self.wait(1.5)


# =================================================================
# 1.3  Linear combinations and the consistency theorem
# =================================================================
class LinearCombination(Scene):
    def construct(self):
        plane = NumberPlane(x_range=[-6, 6, 1], y_range=[-4, 4, 1], x_length=10, y_length=6.6,
                            background_line_style={"stroke_color": "#26323e", "stroke_width": 1},
                            axis_config={"stroke_color": MUTE}).shift(DOWN * 0.3)
        t = title(r"$A\mathbf{x} = x_1\mathbf{a}_1 + x_2\mathbf{a}_2$: a linear combination of the columns")
        bg = BackgroundRectangle(t, fill_color=BG, fill_opacity=0.9, buff=0.1)
        self.add(plane, bg, t)
        a1, a2 = np.array([2, 1]), np.array([-1, 2])
        o = plane.c2p(0, 0)
        v1 = Arrow(o, plane.c2p(*a1), buff=0, color=C1, stroke_width=6)
        v2 = Arrow(o, plane.c2p(*a2), buff=0, color=C2, stroke_width=6)
        l1 = MathTex(r"\mathbf{a}_1", color=C1).next_to(v1.get_end(), DR, buff=0.05)
        l2 = MathTex(r"\mathbf{a}_2", color=C2).next_to(v2.get_end(), UL, buff=0.05)
        self.play(GrowArrow(v1), GrowArrow(v2), FadeIn(l1, l2))

        x1, x2 = ValueTracker(0.0), ValueTracker(0.0)
        p1 = always_redraw(lambda: Arrow(o, plane.c2p(*(x1.get_value() * a1)), buff=0, color=C1, stroke_width=7, max_tip_length_to_length_ratio=0.2))
        p2 = always_redraw(lambda: Arrow(plane.c2p(*(x1.get_value() * a1)), plane.c2p(*(x1.get_value() * a1 + x2.get_value() * a2)), buff=0, color=C2, stroke_width=7, max_tip_length_to_length_ratio=0.2))
        res = always_redraw(lambda: DashedLine(o, plane.c2p(*(x1.get_value() * a1 + x2.get_value() * a2)), color=C3, stroke_width=4))
        readout = always_redraw(lambda: MathTex(
            rf"{x1.get_value():.1f}\,\mathbf{{a}}_1 + {x2.get_value():.1f}\,\mathbf{{a}}_2", font_size=36
        ).add_background_rectangle(color=BG, opacity=0.85).to_corner(UR).shift(DOWN * 0.9))
        b = np.array([1, 3])
        bdot = Circle(radius=0.16, color=INK, stroke_width=3).move_to(plane.c2p(*b))
        blab = MathTex(r"\mathbf{b}", font_size=40).next_to(bdot, UR, buff=0.05)
        self.play(FadeIn(bdot, blab), FadeIn(readout))
        self.add(p1, p2, res)
        self.play(x1.animate.set_value(1.0), run_time=1.2)
        self.play(x2.animate.set_value(1.0), run_time=1.2)
        self.play(Flash(bdot, color=C3))
        hit = Tex(r"$\mathbf{b} = 1\,\mathbf{a}_1 + 1\,\mathbf{a}_2$, so $\mathbf{x} = (1,1)$ solves $A\mathbf{x}=\mathbf{b}$", font_size=32, color=C3)
        hit.add_background_rectangle(color=BG, opacity=0.9).to_edge(DOWN, buff=0.35)
        self.play(FadeIn(hit))
        self.wait(1)
        # span: the slanted lattice
        lat = VGroup()
        for k in range(-6, 7):
            lat.add(Line(plane.c2p(*(k * a1 - 8 * a2)), plane.c2p(*(k * a1 + 8 * a2)), color=C2, stroke_opacity=0.25, stroke_width=1.5))
            lat.add(Line(plane.c2p(*(k * a2 - 8 * a1)), plane.c2p(*(k * a2 + 8 * a1)), color=C1, stroke_opacity=0.25, stroke_width=1.5))
        self.play(Create(lat), run_time=1.5)
        th = Tex(r"$A\mathbf{x}=\mathbf{b}$ is consistent $\iff$ $\mathbf{b}$ is a combination of the columns.", font_size=32)
        th.add_background_rectangle(color=BG, opacity=0.9).to_edge(DOWN, buff=0.35)
        self.play(FadeTransform(hit, th))
        self.wait(2)


# =================================================================
# 1.3  Matrix multiplication: row times column
# =================================================================
class MatrixProduct(Scene):
    def construct(self):
        self.add(title(r"$c_{ij}$ = (row $i$ of $A$) $\cdot$ (column $j$ of $B$)"))
        A = mat([[3, -2], [2, 4], [1, -3]])
        B = mat([[-2, 1, 3], [4, 1, 6]])
        C = mat([[-14, 1, -3], [12, 6, 30], [-10, -2, -15]], h=1.25)
        row = VGroup(A, B, MathTex("="), C).arrange(RIGHT, buff=0.4).shift(UP * 0.5)
        for e in C.get_entries():
            e.set_opacity(0)
        self.play(FadeIn(A, B), FadeIn(row[2]), FadeIn(C.get_brackets()))
        formula = MathTex("", font_size=36)
        Arows, Bcols = A.get_rows(), B.get_columns()
        for i in range(3):
            for j in range(3):
                ra = SurroundingRectangle(Arows[i], color=C1, buff=0.08)
                cb = SurroundingRectangle(Bcols[j], color=C2, buff=0.08)
                a, b = [3, -2, 2, 4, 1, -3][2 * i:2 * i + 2], [[-2, 4], [1, 1], [3, 6]][j]
                terms = " + ".join(f"({x})({y})" if x < 0 or y < 0 else f"{x}\\cdot{y}" for x, y in zip(a, b))
                val = a[0] * b[0] + a[1] * b[1]
                nf = MathTex(rf"c_{{{i+1}{j+1}}} = {terms} = {val}", font_size=38).next_to(row, DOWN, buff=0.8)
                rt = 0.7 if (i, j) == (0, 0) else 0.3
                self.play(Create(ra), Create(cb), FadeTransform(formula, nf), run_time=rt)
                formula = nf
                e = C.get_entries()[3 * i + j]
                e.set_opacity(1).set_color(C3)
                self.play(TransformFromCopy(VGroup(Arows[i], Bcols[j]), e), run_time=0.8 if (i, j) == (0, 0) else 0.35)
                self.play(FadeOut(ra), FadeOut(cb), e.animate.set_color(INK), run_time=0.2)
                if (i, j) == (0, 0):
                    self.wait(0.6)
        self.play(FadeOut(formula), FadeIn(caption(r"$A$ is $3\times 2$, $B$ is $2\times 3$: inner sizes match, $AB$ is $3\times 3$.")))
        self.wait(1.8)


# =================================================================
# 1.3  Transpose and symmetric matrices
# =================================================================
class Transpose(Scene):
    def construct(self):
        self.add(title(r"Transpose: $b_{ji} = a_{ij}$, rows become columns"))
        A = mat([[1, 2, 3], [4, 5, 6]], h=1.1, v=1.0, scale=1.0).shift(LEFT * 3)
        At = mat([[1, 4], [2, 5], [3, 6]], h=1.1, v=1.0, scale=1.0).shift(RIGHT * 3)
        la = MathTex("A", font_size=44).next_to(A, DOWN)
        lt = MathTex("A^T", font_size=44).next_to(At, DOWN)
        self.play(FadeIn(A), FadeIn(la))
        A.get_rows()[0].set_color(C1)
        A.get_rows()[1].set_color(C2)
        self.play(FadeIn(At.get_brackets()), FadeIn(lt))
        moves = []
        for i in range(2):
            for j in range(3):
                src = A.get_entries()[3 * i + j]
                dst = At.get_entries()[2 * j + i]
                moves.append(TransformFromCopy(src, dst.set_color(C1 if i == 0 else C2), path_arc=-PI / 3))
        self.play(LaggedStart(*moves, lag_ratio=0.15), run_time=2.4)
        self.wait(0.8)
        self.play(*[FadeOut(m) for m in self.mobjects if m is not self.mobjects[0]])

        S = mat([[1, 2, 3], [2, 5, 4], [3, 4, 3]], h=1.1, v=1.0, scale=1.1)
        st = Tex(r"Symmetric: $A^T = A$", font_size=40, color=C3).next_to(S, DOWN, buff=0.5)
        self.play(FadeIn(S))
        E = S.get_entries()
        diag = DashedLine(E[0].get_center() + UL * 0.4, E[8].get_center() + DR * 0.4, color=AMB)
        self.play(Create(diag))
        pairs = [(1, 3), (2, 6), (5, 7)]
        cols = [C1, C2, C3]
        self.play(*[VGroup(E[a], E[b]).animate.set_color(c) for (a, b), c in zip(pairs, cols)])
        self.play(*[Swap(E[a], E[b], path_arc=PI / 2) for a, b in pairs], run_time=1.5)
        self.play(Write(st))
        self.play(FadeIn(caption(r"Reflecting across the diagonal changes nothing.")))
        self.wait(1.5)


# =================================================================
# 1.4  Identity, inverse, singular — as maps of the plane
# =================================================================
class InverseMap(Scene):
    def construct(self):
        bgp = NumberPlane(x_range=[-8, 8], y_range=[-5, 5], background_line_style={"stroke_color": "#26323e", "stroke_width": 1},
                          axis_config={"stroke_color": "#3a4654"})
        grid = NumberPlane(x_range=[-10, 10], y_range=[-8, 8], background_line_style={"stroke_color": C1, "stroke_opacity": 0.55, "stroke_width": 1.5},
                           axis_config={"stroke_color": INK, "stroke_width": 2}, faded_line_ratio=1)
        e1 = Arrow(ORIGIN, RIGHT, buff=0, color=C3, stroke_width=7)
        e2 = Arrow(ORIGIN, UP, buff=0, color=C2, stroke_width=7)
        moving = VGroup(grid, e1, e2)
        self.add(bgp, moving)

        def label(tex, color=INK):
            m = Tex(tex, font_size=36, color=color).to_corner(UL)
            return VGroup(BackgroundRectangle(m, fill_color=BG, fill_opacity=0.92, buff=0.12), m)

        lab = label(r"$A = \begin{pmatrix}2&1\\1&1\end{pmatrix}$ moves the plane")
        self.play(FadeIn(lab), run_time=0.6)
        self.play(ApplyMatrix([[2, 1], [1, 1]], moving), run_time=1.8)
        new = label(r"$A^{-1} = \begin{pmatrix}1&-1\\-1&2\end{pmatrix}$ moves it back")
        self.play(FadeTransform(lab, new)); lab = new
        self.play(ApplyMatrix([[1, -1], [-1, 2]], moving), run_time=1.8)
        new = label(r"$A^{-1}A = I$: every vector is back where it started", C3)
        self.play(FadeTransform(lab, new)); lab = new
        self.wait(1.2)
        new = label(r"Singular $\begin{pmatrix}1&2\\2&4\end{pmatrix}$: the plane collapses onto a line", WARN)
        self.play(FadeTransform(lab, new)); lab = new
        self.play(ApplyMatrix([[1, 2], [2, 4]], moving), run_time=2)
        last = Tex(r"Different vectors land on the same point, so no matrix can undo this.", font_size=30, color=WARN)
        last = VGroup(BackgroundRectangle(last, fill_color=BG, fill_opacity=0.92, buff=0.12), last).to_edge(DOWN, buff=0.35)
        self.play(FadeIn(last))
        self.wait(2)


# =================================================================
# 1.5  Elementary matrices
# =================================================================
class ElementaryMatrix(Scene):
    def construct(self):
        self.add(title(r"Elementary matrix = $I$ after one row operation"))
        I = mat([[1, 0, 0], [0, 1, 0], [0, 0, 1]]).shift(LEFT * 3.5 + UP * 1.2)
        li = MathTex("I", font_size=40).next_to(I, RIGHT, buff=0.3)
        self.play(FadeIn(I, li))
        op = Tex(r"$R_3 \leftarrow R_3 - 2R_1$ (type III)", font_size=34, color=C1).next_to(I, RIGHT, buff=1.2)
        self.play(Write(op))
        E = mat([[1, 0, 0], [0, 1, 0], [-2, 0, 1]]).move_to(I)
        self.play(ReplacementTransform(I, E), run_time=1)
        self.play(Indicate(E.get_entries()[6], color=C1, scale_factor=1.6))
        le = MathTex("E", font_size=40).next_to(E, RIGHT, buff=0.3)
        self.play(ReplacementTransform(li, le))

        A = mat([[2, 4, 2], [1, 5, 2], [4, -1, 9]])
        R = mat([[2, 4, 2], [1, 5, 2], [0, -9, 5]])
        grp = VGroup(E.copy(), MathTex(r"\times"), A, MathTex("="), R).arrange(RIGHT, buff=0.3).shift(DOWN * 1.65)
        self.play(TransformFromCopy(E, grp[0]), FadeIn(grp[1], A, grp[3]), FadeIn(R.get_brackets()), *[FadeIn(R.get_rows()[i]) for i in range(2)])
        R.get_rows()[2].set_opacity(0)
        self.play(Create(b1 := row_box(A, 0, MUTE)), Create(b2 := row_box(A, 2, C1)))
        R.get_rows()[2].set_opacity(1).set_color(C3)
        self.play(TransformFromCopy(VGroup(A.get_rows()[0], A.get_rows()[2]), R.get_rows()[2]), run_time=1.2)
        self.play(FadeOut(b1, b2))
        c = Tex(r"$EA$ = $A$ after the same row operation. $E^{-1}$ (with $+2$) undoes it.", font_size=30, color=MUTE).to_edge(DOWN, buff=0.35)
        self.play(FadeIn(c))
        self.wait(2)


# =================================================================
# 1.5  Triangular factorization A = LU
# =================================================================
class LUFactorization(Scene):
    def construct(self):
        self.add(title(r"Triangular factorization $A = LU$"))
        U = mat([[2, 4, 2], [1, 5, 2], [4, -1, 9]], h=1.1).shift(RIGHT * 2.8 + UP * 0.4)
        L = mat([[1, 0, 0], [r"\cdot", 1, 0], [r"\cdot", r"\cdot", 1]], h=1.1).shift(LEFT * 2.8 + UP * 0.4)
        lu = MathTex("U", font_size=40).next_to(U, DOWN)
        ll = MathTex("L", font_size=40).next_to(L, DOWN)
        lu_txt = Tex(r"(starts as $A$)", font_size=28, color=MUTE).next_to(lu, RIGHT)
        self.play(FadeIn(U, L, lu, ll, lu_txt))
        steps = [
            ((1, 0), r"\tfrac12", [[2, 4, 2], [0, 3, 1], [4, -1, 9]]),
            ((2, 0), "2", [[2, 4, 2], [0, 3, 1], [0, -9, 5]]),
            ((2, 1), "-3", [[2, 4, 2], [0, 3, 1], [0, 0, 8]]),
        ]
        Lrows = [[1, 0, 0], [r"\cdot", 1, 0], [r"\cdot", r"\cdot", 1]]
        info = Tex("", font_size=34)
        for (i, j), lval, new_rows in steps:
            target = U.get_entries()[3 * i + j]
            piv = U.get_entries()[3 * j + j]
            new_info = Tex(rf"$l_{{{i+1}{j+1}}} = {lval}$: subtract ${lval}\times R_{j+1}$ from $R_{i+1}$", font_size=34, color=C1).to_edge(DOWN, buff=1.0)
            self.play(Indicate(target, color=C2, scale_factor=1.4), Circumscribe(piv, color=C3, shape=Circle), FadeTransform(info, new_info), run_time=0.9)
            info = new_info
            mult = MathTex(lval, color=AMB, font_size=44).next_to(target, UP, buff=0.05)
            self.play(FadeIn(mult, scale=1.5), run_time=0.4)
            Lrows[i][j] = lval
            newL = mat(Lrows, h=1.1).move_to(L)
            newL.get_entries()[3 * i + j].set_color(AMB)
            self.play(mult.animate.move_to(L.get_entries()[3 * i + j]).set_opacity(0), run_time=0.9)
            self.play(ReplacementTransform(L, newL), run_time=0.4)
            L = newL
            newU = mat(new_rows, h=1.1).move_to(U)
            newU.get_entries()[3 * i + j].set_color(C3)
            self.play(ReplacementTransform(U, newU), run_time=0.8)
            U = newU
            self.remove(mult)
        self.play(FadeOut(lu_txt), FadeOut(info))
        eq = MathTex(r"L\,U = A", font_size=48, color=C3).to_edge(DOWN, buff=0.9)
        self.play(Write(eq))
        self.play(FadeIn(caption(r"$L$ stores the multipliers $l_{ij}$; $U$ is what elimination leaves.")))
        self.wait(2)


# =================================================================
# 1.6  Partitioned (block) matrices
# =================================================================
class BlockMultiply(Scene):
    def construct(self):
        self.add(title(r"Partitioned matrices multiply block by block"))
        nums = mat([[1, -2, 4, 1], [2, 1, 1, 1], [3, 3, 2, -1], [4, 6, 2, 2]], h=0.95, v=0.7, scale=0.85).shift(UP * 0.4)
        self.play(FadeIn(nums))
        E = nums.get_entries()
        midx = (E[1].get_right()[0] + E[2].get_left()[0]) / 2
        midy = (E[4].get_bottom()[1] + E[8].get_top()[1]) / 2
        br = nums.get_brackets()
        vl = Line([midx, br.get_top()[1], 0], [midx, br.get_bottom()[1], 0], color=AMB, stroke_width=3)
        hl = Line([br[0].get_right()[0], midy, 0], [br[1].get_left()[0], midy, 0], color=AMB, stroke_width=3)
        self.play(Create(vl), Create(hl))
        quads = [VGroup(E[0], E[1], E[4], E[5]), VGroup(E[2], E[3], E[6], E[7]), VGroup(E[8], E[9], E[12], E[13]), VGroup(E[10], E[11], E[14], E[15])]
        names = ["A_{11}", "A_{12}", "A_{21}", "A_{22}"]
        cols = [C1, C2, C3, AMB]
        tags = VGroup(*[MathTex(n, color=c, font_size=40).move_to(q) for q, n, c in zip(quads, names, cols)])
        self.play(*[q.animate.set_color(c) for q, c in zip(quads, cols)])
        self.play(*[FadeTransform(q, t) for q, t in zip(quads, tags)], run_time=1)
        self.wait(0.4)
        self.play(FadeOut(VGroup(tags, vl, hl, nums)))

        A = Matrix([["A_{11}", "A_{12}"], ["A_{21}", "A_{22}"]], h_buff=1.4)
        B = Matrix([["B_{11}", "B_{12}"], ["B_{21}", "B_{22}"]], h_buff=1.4)
        C = Matrix([["A_{11}B_{11}+A_{12}B_{21}", "A_{11}B_{12}+A_{12}B_{22}"],
                    ["A_{21}B_{11}+A_{22}B_{21}", "A_{21}B_{12}+A_{22}B_{22}"]], h_buff=4.2)
        for m in (A, B, C):
            m.get_brackets().set_color(INK)
        g = VGroup(A, B, MathTex("="), C).arrange(RIGHT, buff=0.3).scale(0.72).shift(UP * 0.2)
        for e in C.get_entries():
            e.set_opacity(0)
        self.play(FadeIn(A, B, g[2], C.get_brackets()))
        for i in range(2):
            for j in range(2):
                ra = SurroundingRectangle(A.get_rows()[i], color=C1, buff=0.08)
                cb = SurroundingRectangle(B.get_columns()[j], color=C2, buff=0.08)
                e = C.get_entries()[2 * i + j]
                e.set_opacity(1).set_color(C3)
                self.play(Create(ra), Create(cb), run_time=0.3)
                self.play(TransformFromCopy(VGroup(A.get_rows()[i], B.get_columns()[j]), e), run_time=0.7)
                self.play(FadeOut(ra, cb), e.animate.set_color(INK), run_time=0.2)
        self.play(FadeIn(caption(r"Row-times-column rule with blocks for numbers; keep the order $A_{ik}B_{kj}$.")))
        self.wait(2)


# =================================================================
# 1.6  Outer product expansion
# =================================================================
class OuterProduct(Scene):
    def construct(self):
        self.add(title(r"Outer product: a column times a row"))
        x = [3, 2, 1]
        y = [1, 2, 3]
        cells = VGroup()
        grid_origin = LEFT * 5.0 + UP * 0.2
        xs = VGroup(*[MathTex(str(v), color=C1, font_size=40).move_to(grid_origin + LEFT * 1.0 + DOWN * 0.75 * i) for i, v in enumerate(x)])
        ys = VGroup(*[MathTex(str(v), color=C2, font_size=40).move_to(grid_origin + RIGHT * 0.9 * j + UP * 0.85) for j, v in enumerate(y)])
        lx = MathTex(r"\mathbf{x}_1", color=C1, font_size=36).next_to(xs, LEFT, buff=0.35)
        ly = MathTex(r"\mathbf{y}_1^T", color=C2, font_size=36).next_to(ys, UP, buff=0.25)
        self.play(FadeIn(xs, ys, lx, ly))
        for i in range(3):
            for j in range(3):
                sq = Square(0.7, stroke_color=MUTE, stroke_width=1, fill_color=C1, fill_opacity=0.08 + 0.05 * x[i] * y[j]).move_to(grid_origin + RIGHT * 0.9 * j + DOWN * 0.75 * i)
                t = MathTex(str(x[i] * y[j]), font_size=36).move_to(sq)
                cells.add(VGroup(sq, t))
        self.play(LaggedStart(*[FadeIn(c, scale=0.6) for c in cells], lag_ratio=0.08), run_time=2)
        note = Tex(r"every row is a multiple of $\mathbf{y}_1^T$", font_size=30, color=MUTE).next_to(cells, DOWN, buff=0.4)
        self.play(FadeIn(note))
        self.wait(0.6)
        # full expansion
        T1 = mat([[3, 6, 9], [2, 4, 6], [1, 2, 3]], scale=0.7)
        T2 = mat([[2, 4, 1], [8, 16, 4], [4, 8, 2]], scale=0.7)
        P = mat([[5, 10, 10], [10, 20, 10], [5, 10, 5]], scale=0.7)
        eqn = VGroup(T1, MathTex("+"), T2, MathTex("="), P).arrange(RIGHT, buff=0.25).scale(0.9).move_to(RIGHT * 2.7 + DOWN * 0.1)
        labs = VGroup(MathTex(r"\mathbf{x}_1\mathbf{y}_1^T", color=C1, font_size=30).next_to(T1, DOWN),
                      MathTex(r"\mathbf{x}_2\mathbf{y}_2^T", color=C2, font_size=30).next_to(T2, DOWN),
                      MathTex(r"XY^T", color=C3, font_size=30).next_to(P, DOWN))
        self.play(FadeOut(note), ReplacementTransform(cells.copy(), T1), FadeIn(labs[0]))
        self.play(FadeIn(eqn[1], T2, labs[1]))
        self.play(FadeIn(eqn[3]), TransformFromCopy(VGroup(T1, T2), P), FadeIn(labs[2]))
        self.play(FadeIn(caption(r"$XY^T = \mathbf{x}_1\mathbf{y}_1^T + \mathbf{x}_2\mathbf{y}_2^T$ (Example 3, §1.6)")))
        self.wait(2)


# =================================================================
# Application: a linear layer of a neural network
# =================================================================
class LinearLayer(Scene):
    def construct(self):
        self.add(title(r"A linear layer computes $\mathbf{h} = W\mathbf{x} + \mathbf{b}$"))
        xs = [np.array([-4.6, y, 0]) for y in (1.4, 0, -1.4)]
        hs = [np.array([-1.0, y, 0]) for y in (2.1, 0.7, -0.7, -2.1)]
        ys = [np.array([2.6, y, 0]) for y in (0.7, -0.7)]
        W1 = [[1, -1, 0.5], [0.5, 1, 0], [-1, 0, 1], [0, 0.5, -0.5]]
        W2 = [[1, 0.5, -1, 0], [0, 1, 0.5, -1]]

        def node(p, t, c=INK):
            return VGroup(Circle(0.32, color=c, stroke_width=3).set_fill(BG, 1).move_to(p), MathTex(t, font_size=30).move_to(p))

        def edges(A, B, W):
            g = VGroup()
            for i, q in enumerate(B):
                for j, p in enumerate(A):
                    w = W[i][j]
                    if w == 0:
                        continue
                    g.add(Line(p, q, buff=0.34, color=C1 if w > 0 else C2, stroke_width=1.5 + 2.5 * abs(w), stroke_opacity=0.6))
            return g

        X = VGroup(*[node(p, f"x_{k+1}") for k, p in enumerate(xs)])
        H = VGroup(*[node(p, f"h_{k+1}") for k, p in enumerate(hs)])
        Y = VGroup(*[node(p, f"y_{k+1}") for k, p in enumerate(ys)])
        E1, E2 = edges(xs, hs, W1), edges(hs, ys, W2)
        self.play(FadeIn(X), run_time=0.5)
        self.play(Create(E1), FadeIn(H), run_time=1.2)
        # neuron h1 = row 1 of W1
        hl = VGroup(*[Line(p, hs[0], buff=0.34, color=AMB, stroke_width=6) for j, p in enumerate(xs) if W1[0][j] != 0])
        f = MathTex(r"h_1 = 1\cdot x_1 - 1\cdot x_2 + 0.5\cdot x_3 + b_1", font_size=34).to_edge(RIGHT, buff=0.3).shift(UP * 2.4)
        f2 = Tex(r"= row 1 of $W_1$ times $\mathbf{x}$", font_size=30, color=AMB).next_to(f, DOWN, aligned_edge=LEFT)
        self.play(Create(hl), Write(f), FadeIn(f2))
        self.wait(0.8)
        self.play(FadeOut(hl, f, f2))
        self.play(Create(E2), FadeIn(Y), run_time=1.2)
        two = MathTex(r"\mathbf{y} = W_2(W_1\mathbf{x} + \mathbf{b}_1) + \mathbf{b}_2", font_size=36).to_edge(DOWN, buff=1.0)
        self.play(Write(two))
        self.wait(0.6)
        one = MathTex(r"\mathbf{y} = (W_2W_1)\mathbf{x} + (W_2\mathbf{b}_1 + \mathbf{b}_2)", font_size=36, color=C3).move_to(two)
        self.play(TransformMatchingTex(two, one))
        # collapse: hidden layer vanishes
        W = np.array(W2) @ np.array(W1)
        E = edges(xs, ys, W.tolist())
        self.play(FadeOut(H, E1, E2), Create(E), run_time=1.4)
        c = Tex(r"Without a nonlinearity, two layers are one matrix $W = W_2W_1$.", font_size=32, color=MUTE).to_edge(DOWN, buff=0.35)
        self.play(FadeIn(c))
        self.wait(2)
