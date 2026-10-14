"""
Manim scenes for Chapter 2 (Determinants) of
S. J. Leon, Linear Algebra with Applications (8th ed.).

Render:  manim -qm extras/manim/chapter2_definitions.py CofactorExpansion
"""
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from la_style import *  # noqa: E402,F401,F403


def parallelogram(p, u, v, color, opacity=0.35):
    o = p.c2p(0, 0)
    pts = [o, p.c2p(*u), p.c2p(u[0] + v[0], u[1] + v[1]), p.c2p(*v)]
    return Polygon(*pts, color=color, fill_color=color, fill_opacity=opacity, stroke_width=3)


# =================================================================
# 2.1  Minors, cofactors and the cofactor expansion
# =================================================================
class CofactorExpansion(Scene):
    def construct(self):
        self.add(title(r"Cofactor expansion along the first row"))
        A = [[3, 2, 4], [1, -2, 3], [2, 3, 2]]
        m = mat(A, h=1.0, scale=0.95).shift(LEFT * 4.3 + UP * 0.9)
        la = MathTex("A", font_size=40).next_to(m, DOWN)
        self.play(FadeIn(m, la))
        signs = mat([["+", "-", "+"], ["-", "+", "-"], ["+", "-", "+"]], scale=0.7).next_to(m, RIGHT, buff=0.9)
        sl = Tex(r"signs $(-1)^{i+j}$", font_size=28, color=MUTE).next_to(signs, DOWN)
        self.play(FadeIn(signs, sl))
        E = m.get_entries()
        minors = [[[-2, 3], [3, 2]], [[1, 3], [2, 2]], [[1, -2], [2, 3]]]
        dets = [-13, -4, 7]
        sg = [1, -1, 1]
        line = MathTex(r"\det A =", font_size=42).to_corner(DL, buff=0.9).shift(UP * 0.5)
        self.play(Write(line))
        anchor = line
        shown = VGroup()
        for j in range(3):
            hl = SurroundingRectangle(E[j], color=AMB, buff=0.08)
            dim = VGroup(*[E[k] for k in range(9) if (k // 3 == 0 or k % 3 == j) and k != j])
            keep = VGroup(*[E[k] for k in range(9) if not (k // 3 == 0 or k % 3 == j)])
            self.play(Create(hl), dim.animate.set_opacity(0.2), keep.animate.set_color(C1))
            M = mat(minors[j], scale=0.85).shift(RIGHT * 3.9 + UP * 0.9)
            Ml = MathTex(f"M_{{1{j + 1}}}", font_size=36, color=C1).next_to(M, UP)
            self.play(TransformFromCopy(keep, M.get_entries()), FadeIn(M.get_brackets(), Ml))
            dt = MathTex(rf"\det M_{{1{j + 1}}} = {dets[j]}", font_size=34, color=C1).next_to(M, DOWN)
            self.play(Write(dt))
            self.play(Indicate(signs.get_entries()[j], color=AMB, scale_factor=1.7))
            pre = "" if j == 0 else (" + " if sg[j] > 0 else " - ")
            term = MathTex(pre + rf"{A[0][j]}\,({dets[j]})", font_size=42).next_to(anchor, RIGHT, buff=0.15)
            term.set_color_by_tex(str(A[0][j]), INK)
            self.play(TransformFromCopy(VGroup(E[j], dt), term))
            shown.add(term)
            anchor = term
            self.play(FadeOut(hl, M, Ml, dt), dim.animate.set_opacity(1), keep.animate.set_color(INK))
        res = MathTex(r"= -39 + 8 + 28 = -3", font_size=42, color=C3).next_to(line, DOWN, aligned_edge=LEFT, buff=0.35)
        self.play(Write(res))
        self.play(FadeIn(caption(r"$\det A = a_{11}A_{11} + a_{12}A_{12} + a_{13}A_{13}$, with cofactor $A_{ij} = (-1)^{i+j}\det M_{ij}$.")))
        self.wait(2)


# =================================================================
# 2.1  The determinant as a signed area
# =================================================================
class DeterminantArea(Scene):
    def construct(self):
        p = plane((-4, 6), (-3, 4)).shift(LEFT * 1.6 + DOWN * 0.2)
        t = title(r"$|\det A|$ is the area spanned by the columns; the sign is the orientation")
        self.add(p, BackgroundRectangle(t, fill_color=BG, fill_opacity=0.9, buff=0.1), t)
        a1x, a1y, a2x, a2y = ValueTracker(1), ValueTracker(0), ValueTracker(0), ValueTracker(1)
        det = lambda: a1x.get_value() * a2y.get_value() - a2x.get_value() * a1y.get_value()
        para = always_redraw(lambda: parallelogram(p, (a1x.get_value(), a1y.get_value()), (a2x.get_value(), a2y.get_value()),
                                                   C3 if det() > 1e-6 else (WARN if det() < -1e-6 else MUTE)))
        v1 = always_redraw(lambda: Arrow(p.c2p(0, 0), p.c2p(a1x.get_value(), a1y.get_value()), buff=0, color=C1, stroke_width=6))
        v2 = always_redraw(lambda: Arrow(p.c2p(0, 0), p.c2p(a2x.get_value(), a2y.get_value()), buff=0, color=C2, stroke_width=6))
        l1 = always_redraw(lambda: MathTex(r"\mathbf a_1", color=C1).next_to(v1.get_end(), DR, buff=0.05))
        l2 = always_redraw(lambda: MathTex(r"\mathbf a_2", color=C2).next_to(v2.get_end(), UL, buff=0.05))
        readout = always_redraw(lambda: boxed(VGroup(MathTex(r"\det A = a_{11}a_{22} - a_{12}a_{21} =", font_size=34),
                                                     DecimalNumber(det(), num_decimal_places=2, font_size=34,
                                                                   color=C3 if det() > 1e-6 else (WARN if det() < -1e-6 else MUTE))).arrange(RIGHT)).to_corner(UR).shift(DOWN * 0.8))
        self.add(para, v1, v2, l1, l2, readout)
        note = boxed(Tex(r"$A = I$: the unit square, area 1", font_size=32)).to_edge(DOWN, buff=0.35)
        self.play(FadeIn(note))
        self.wait(0.6)
        self.play(a1x.animate.set_value(2), a1y.animate.set_value(0.5), a2x.animate.set_value(0.5), a2y.animate.set_value(1.5), run_time=2)
        n2 = boxed(Tex(r"Columns $(2,\,0.5)$ and $(0.5,\,1.5)$: area $= 3 - 0.25 = 2.75$", font_size=32)).to_edge(DOWN, buff=0.35)
        self.play(FadeTransform(note, n2)); note = n2
        self.wait(1)
        self.play(a2x.animate.set_value(2.5), a2y.animate.set_value(-0.6), run_time=2.4)
        n3 = boxed(Tex(r"$\mathbf a_2$ crossed over $\mathbf a_1$: orientation reversed, $\det A < 0$", font_size=32, color=WARN)).to_edge(DOWN, buff=0.35)
        self.play(FadeTransform(note, n3)); note = n3
        self.wait(1)
        self.play(a2x.animate.set_value(3), a2y.animate.set_value(0.75), run_time=2)
        n4 = boxed(Tex(r"Parallel columns: zero area, $\det A = 0$, so $A$ is singular", font_size=32, color=MUTE)).to_edge(DOWN, buff=0.35)
        self.play(FadeTransform(note, n4))
        self.wait(2)


# =================================================================
# 2.2  How row operations change the determinant
# =================================================================
class RowOpsDeterminant(Scene):
    def construct(self):
        p = plane((-4, 5), (-3.5, 4)).shift(RIGHT * 2.2 + DOWN * 0.3)
        t = title(r"Row operations and the determinant")
        self.add(p, BackgroundRectangle(t, fill_color=BG, fill_opacity=0.9, buff=0.1), t)
        r = [ValueTracker(v) for v in (2, 1, 1, 2)]  # rows r1=(r0,r1), r2=(r2,r3)
        det = lambda: r[0].get_value() * r[3].get_value() - r[1].get_value() * r[2].get_value()
        para = always_redraw(lambda: parallelogram(p, (r[0].get_value(), r[1].get_value()), (r[2].get_value(), r[3].get_value()),
                                                   C3 if det() > 1e-6 else (WARN if det() < -1e-6 else MUTE)))
        v1 = always_redraw(lambda: Arrow(p.c2p(0, 0), p.c2p(r[0].get_value(), r[1].get_value()), buff=0, color=C1, stroke_width=6))
        v2 = always_redraw(lambda: Arrow(p.c2p(0, 0), p.c2p(r[2].get_value(), r[3].get_value()), buff=0, color=C2, stroke_width=6))

        def matrix_mob():
            vals = [[r[0].get_value(), r[1].get_value()], [r[2].get_value(), r[3].get_value()]]
            m = Matrix([[f"{x:g}" for x in row] for row in vals], h_buff=1.1).scale(0.8)
            m.get_brackets().set_color(INK)
            m.get_rows()[0].set_color(C1)
            m.get_rows()[1].set_color(C2)
            d = VGroup(MathTex(r"\det =", font_size=36), DecimalNumber(det(), num_decimal_places=2, font_size=36)).arrange(RIGHT)
            return VGroup(m, d).arrange(DOWN, buff=0.3).to_corner(UL).shift(DOWN * 1.0 + RIGHT * 0.2)

        mm = always_redraw(matrix_mob)
        self.add(para, v1, v2, mm)
        cap = Tex(r"Rows $\mathbf r_1, \mathbf r_2$ span a parallelogram of area $|\det A|$", font_size=30, color=MUTE).to_corner(DL).shift(UP * 0.2)
        self.play(FadeIn(cap))
        self.wait(0.8)
        steps = [
            (r"III: $R_2 \leftarrow R_2 - \tfrac12 R_1$ \;\; shear, area unchanged", C1, (2, 1, 0, 1.5)),
            (r"II: $R_2 \leftarrow 2R_2$ \;\; area and $\det$ doubled", C2, (2, 1, 0, 3)),
            (r"I: $R_1 \leftrightarrow R_2$ \;\; orientation flips, $\det$ changes sign", AMB, (0, 3, 2, 1)),
        ]
        lab = None
        for text, col, target in steps:
            new = boxed(Tex(text, font_size=32, color=col)).to_edge(DOWN, buff=0.35)
            self.play(FadeIn(new) if lab is None else FadeTransform(lab, new))
            lab = new
            self.play(*[tr.animate.set_value(v) for tr, v in zip(r, target)], run_time=2.2)
            self.wait(1)
        self.play(FadeOut(cap))
        fin = Tex(r"Reduce to triangular form, multiply the pivots,\\ then undo the effect of every swap and scaling.", font_size=30, color=C3).to_corner(DL).shift(UP * 0.9)
        self.play(Write(fin))
        self.wait(2)


# =================================================================
# 2.2  det(AB) = det(A) det(B)
# =================================================================
class ProductRule(Scene):
    def construct(self):
        self.add(title(r"$\det(AB) = \det(A)\,\det(B)$: area factors multiply"))
        bgp = plane((-6, 6), (-4, 4))
        grid = NumberPlane(x_range=[-6, 6], y_range=[-4, 4], background_line_style={"stroke_color": C1, "stroke_opacity": 0.35, "stroke_width": 1.2},
                           axis_config={"stroke_color": INK}, faded_line_ratio=1)
        sq = Polygon(ORIGIN, RIGHT, RIGHT + UP, UP, color=C3, fill_color=C3, fill_opacity=0.45, stroke_width=3)
        moving = VGroup(grid, sq)
        self.add(bgp, moving)
        t0 = title(r"$\det(AB) = \det(A)\,\det(B)$: area factors multiply")
        self.add(BackgroundRectangle(t0, fill_color=BG, fill_opacity=0.95, buff=0.1), t0)

        def info(tex, col=INK):
            return boxed(Tex(tex, font_size=34, color=col)).to_corner(UL).shift(DOWN * 0.9)

        lab = info(r"unit square: area 1")
        self.play(FadeIn(lab))
        self.play(ApplyMatrix([[1, 1], [0, 2]], moving), run_time=2)
        new = info(r"after $B = \begin{pmatrix}1&1\\0&2\end{pmatrix}$: area $\times \det B = 2$")
        self.play(FadeTransform(lab, new)); lab = new
        self.wait(1)
        self.play(ApplyMatrix([[1.5, 0], [0, 1]], moving), run_time=2)
        new = info(r"then $A = \begin{pmatrix}1.5&0\\0&1\end{pmatrix}$: area $\times \det A = 1.5$")
        self.play(FadeTransform(lab, new)); lab = new
        self.wait(1)
        res = boxed(Tex(r"total area $= 2 \times 1.5 = 3 = \det(AB)$", font_size=36, color=C3)).to_edge(DOWN, buff=0.4)
        self.play(FadeIn(res))
        self.wait(2)


# =================================================================
# 2.3  Cramer's rule, seen as areas
# =================================================================
class CramersRule(Scene):
    def construct(self):
        p = plane((-2, 6), (-1.5, 4)).shift(LEFT * 1.8 + DOWN * 0.6)
        t = title(r"Cramer's rule: $x_1 = \det(A_1)/\det(A)$")
        self.add(p, BackgroundRectangle(t, fill_color=BG, fill_opacity=0.9, buff=0.1), t)
        a1, a2 = np.array([2.0, 0.5]), np.array([0.5, 1.5])
        x1, x2 = 1.2, 0.8
        b = x1 * a1 + x2 * a2
        base = parallelogram(p, a1, a2, C3, 0.3)
        v1 = Arrow(p.c2p(0, 0), p.c2p(*a1), buff=0, color=C1, stroke_width=6)
        v2 = Arrow(p.c2p(0, 0), p.c2p(*a2), buff=0, color=C2, stroke_width=6)
        vb = Arrow(p.c2p(0, 0), p.c2p(*b), buff=0, color=AMB, stroke_width=6)
        lb = MathTex(r"\mathbf b", color=AMB).next_to(vb.get_end(), UR, buff=0.05)
        self.play(GrowArrow(v1), GrowArrow(v2), FadeIn(MathTex(r"\mathbf a_1", color=C1).next_to(v1.get_end(), DR, buff=0.05)),
                  FadeIn(MathTex(r"\mathbf a_2", color=C2).next_to(v2.get_end(), UL, buff=0.05)))
        self.play(FadeIn(base))
        info = boxed(Tex(r"area $= \det A = 2.75$", font_size=32, color=C3)).to_corner(UR).shift(DOWN * 0.8)
        self.play(FadeIn(info))
        self.play(GrowArrow(vb), FadeIn(lb))
        eq = boxed(MathTex(r"\mathbf b = x_1\mathbf a_1 + x_2\mathbf a_2", font_size=36)).next_to(info, DOWN, buff=0.3, aligned_edge=RIGHT)
        self.play(FadeIn(eq))
        s = ValueTracker(0.0)  # slide b back along a2 by s*x2
        sh = always_redraw(lambda: parallelogram(p, b - s.get_value() * x2 * a2, a2, AMB, 0.3))
        self.play(FadeIn(sh))
        i2 = boxed(Tex(r"replace column 1 by $\mathbf b$: area $= \det A_1$", font_size=32, color=AMB)).next_to(eq, DOWN, buff=0.3, aligned_edge=RIGHT)
        self.play(FadeIn(i2))
        self.wait(1)
        i3 = boxed(Tex(r"slide along $\mathbf a_2$ (a shear): the area does not change", font_size=32)).to_edge(DOWN, buff=0.35)
        self.play(FadeIn(i3))
        self.play(s.animate.set_value(1.0), run_time=3)
        i4 = boxed(Tex(r"now it is $x_1$ copies of the base: $\det A_1 = x_1 \det A$", font_size=32, color=C3)).to_edge(DOWN, buff=0.35)
        self.play(FadeTransform(i3, i4))
        self.wait(1)
        fin = boxed(MathTex(r"x_1 = \frac{\det A_1}{\det A} = \frac{3.3}{2.75} = 1.2", font_size=40, color=C3)).next_to(i2, DOWN, buff=0.3, aligned_edge=RIGHT)
        self.play(FadeIn(fin))
        self.wait(2)
